import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { IMAPAccount, EmailDocument, AICategory } from '../types';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export class IMAPService extends EventEmitter {
  private imap: Imap;
  private account: IMAPAccount;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(account: IMAPAccount) {
    super();
    this.account = account;
    this.imap = this.createIMAPConnection();
  }

  private createIMAPConnection(): Imap {
    return new Imap({
      user: this.account.user,
      password: this.account.password,
      host: this.account.host,
      port: this.account.port,
      tls: this.account.tls,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: true,
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', async () => {
        logger.info(`IMAP connected: ${this.account.user}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        try {
          await this.performInitialSync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.imap.once('error', (err: Error) => {
        logger.error({ err }, `IMAP error for ${this.account.user}`);
        this.isConnected = false;
        this.handleReconnect();
      });

      this.imap.once('end', () => {
        logger.info(`IMAP connection ended: ${this.account.user}`);
        this.isConnected = false;
        this.handleReconnect();
      });

      this.imap.connect();
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.imap = this.createIMAPConnection();
        this.connect().catch((err) => {
          logger.error({ err }, 'Reconnection failed');
        });
      }, delay);
    } else {
      logger.error(`Max reconnection attempts reached for ${this.account.user}`);
    }
  }

  private async performInitialSync(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, async (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        logger.info(`Starting initial sync for ${this.account.user}, total messages: ${box.messages.total}`);

        if (box.messages.total === 0) {
          resolve();
          return;
        }

        const start = Math.max(1, box.messages.total - 100);
        const end = box.messages.total;

        logger.info(`Fetching latest 100 emails (${start}:${end}) for ${this.account.user}`);

        try {
          await this.fetchEmails([`${start}:${end}`]);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async fetchEmails(searchCriteria: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.search(searchCriteria, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (results.length === 0) {
          logger.info(`No emails found matching criteria for ${this.account.user}`);
          resolve();
          return;
        }

        logger.info(`Fetching ${results.length} emails for ${this.account.user}`);

        const fetch = this.imap.fetch(results, {
          bodies: '',
          struct: true,
        });

        let processed = 0;

        fetch.on('message', (msg) => {
          let buffer = '';
          let msgAttrs: any;

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            msgAttrs = attrs;
          });

          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer);
              const email = this.createEmailDocument(parsed, msgAttrs);
              this.emit('email', email);
              processed++;

              if (processed === results.length) {
                logger.info(`Initial sync completed: ${processed} emails processed`);
              }
            } catch (error) {
              logger.error({ err: error }, 'Error parsing email');
            }
          });
        });

        fetch.once('error', reject);
        fetch.once('end', () => resolve());
      });
    });
  }

  private createEmailDocument(parsed: any, attrs?: any): EmailDocument {
    const messageId = parsed.messageId || `${Date.now()}-${Math.random()}`;

    return {
      id: messageId,
      accountId: this.account.user,
      folder: 'INBOX',
      subject: parsed.subject || '(No Subject)',
      body: parsed.text || parsed.html || '',
      from: parsed.from?.text || '',
      to: parsed.to?.text ? [parsed.to.text] : [],
      date: parsed.date || new Date(),
      aiCategory: 'Uncategorized' as AICategory,
      indexedAt: new Date(),
    };
  }

  disconnect(): void {
    if (this.isConnected) {
      this.imap.end();
    }
  }
}
