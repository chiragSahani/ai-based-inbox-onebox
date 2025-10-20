"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAPService = void 0;
const node_imap_1 = __importDefault(require("node-imap"));
const mailparser_1 = require("mailparser");
const logger_1 = require("../utils/logger");
const events_1 = require("events");
class IMAPService extends events_1.EventEmitter {
    constructor(account) {
        super();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.account = account;
        this.imap = this.createIMAPConnection();
    }
    createIMAPConnection() {
        return new node_imap_1.default({
            user: this.account.user,
            password: this.account.password,
            host: this.account.host,
            port: this.account.port,
            tls: this.account.tls,
            tlsOptions: { rejectUnauthorized: false },
            keepalive: true,
        });
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', async () => {
                logger_1.logger.info(`IMAP connected: ${this.account.user}`);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                try {
                    await this.performInitialSync();
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
            this.imap.once('error', (err) => {
                logger_1.logger.error({ err }, `IMAP error for ${this.account.user}`);
                this.isConnected = false;
                this.handleReconnect();
            });
            this.imap.once('end', () => {
                logger_1.logger.info(`IMAP connection ended: ${this.account.user}`);
                this.isConnected = false;
                this.handleReconnect();
            });
            this.imap.connect();
        });
    }
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            logger_1.logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.imap = this.createIMAPConnection();
                this.connect().catch((err) => {
                    logger_1.logger.error({ err }, 'Reconnection failed');
                });
            }, delay);
        }
        else {
            logger_1.logger.error(`Max reconnection attempts reached for ${this.account.user}`);
        }
    }
    async performInitialSync() {
        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', false, async (err, box) => {
                if (err) {
                    reject(err);
                    return;
                }
                logger_1.logger.info(`Starting initial sync for ${this.account.user}, total messages: ${box.messages.total}`);
                if (box.messages.total === 0) {
                    resolve();
                    return;
                }
                const start = Math.max(1, box.messages.total - 100);
                const end = box.messages.total;
                logger_1.logger.info(`Fetching latest 100 emails (${start}:${end}) for ${this.account.user}`);
                try {
                    await this.fetchEmails([`${start}:${end}`]);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async fetchEmails(searchCriteria) {
        return new Promise((resolve, reject) => {
            this.imap.search(searchCriteria, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (results.length === 0) {
                    logger_1.logger.info(`No emails found matching criteria for ${this.account.user}`);
                    resolve();
                    return;
                }
                logger_1.logger.info(`Fetching ${results.length} emails for ${this.account.user}`);
                const fetch = this.imap.fetch(results, {
                    bodies: '',
                    struct: true,
                });
                let processed = 0;
                fetch.on('message', (msg) => {
                    let buffer = '';
                    let msgAttrs;
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
                            const parsed = await (0, mailparser_1.simpleParser)(buffer);
                            const email = this.createEmailDocument(parsed, msgAttrs);
                            this.emit('email', email);
                            processed++;
                            if (processed === results.length) {
                                logger_1.logger.info(`Initial sync completed: ${processed} emails processed`);
                            }
                        }
                        catch (error) {
                            logger_1.logger.error({ err: error }, 'Error parsing email');
                        }
                    });
                });
                fetch.once('error', reject);
                fetch.once('end', () => resolve());
            });
        });
    }
    createEmailDocument(parsed, attrs) {
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
            aiCategory: 'Uncategorized',
            indexedAt: new Date(),
        };
    }
    disconnect() {
        if (this.isConnected) {
            this.imap.end();
        }
    }
}
exports.IMAPService = IMAPService;
//# sourceMappingURL=imap.service.js.map