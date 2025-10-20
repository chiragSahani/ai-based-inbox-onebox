import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
import { EmailDocument } from '../types';
import { logger } from '../utils/logger';

export class ElasticsearchService {
  private client: Client;
  private readonly indexName = 'emails';

  constructor() {
    this.client = new Client({ node: config.elasticsearch.url });
  }

  async initialize(): Promise<void> {
    try {
      const indexExists = await this.client.indices.exists({ index: this.indexName });

      if (!indexExists) {
        await this.client.indices.create({
          index: this.indexName,
          mappings: {
            properties: {
              id: { type: 'keyword' },
              accountId: { type: 'keyword' },
              folder: { type: 'keyword' },
              subject: { type: 'text' },
              body: { type: 'text' },
              from: { type: 'keyword' },
              to: { type: 'keyword' },
              date: { type: 'date' },
              aiCategory: { type: 'keyword' },
              indexedAt: { type: 'date' },
            },
          },
        });
        logger.info('Elasticsearch index created successfully');
      } else {
        logger.info('Elasticsearch index already exists');
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize Elasticsearch');
      throw error;
    }
  }

  async indexEmail(email: EmailDocument): Promise<void> {
    try {
      await this.client.index({
        index: this.indexName,
        id: email.id,
        document: email,
      });
      logger.info(`Email indexed: ${email.id}`);
    } catch (error) {
      logger.error({ err: error }, `Failed to index email: ${email.id}`);
      throw error;
    }
  }

  async updateEmailCategory(emailId: string, category: string): Promise<void> {
    try {
      await this.client.update({
        index: this.indexName,
        id: emailId,
        doc: {
          aiCategory: category,
        },
      });
      logger.info(`Email category updated: ${emailId} -> ${category}`);
    } catch (error) {
      logger.error({ err: error }, `Failed to update email category: ${emailId}`);
      throw error;
    }
  }

  async searchEmails(
    query?: string,
    accountId?: string,
    folder?: string,
    aiCategory?: string,
    from: number = 0,
    size: number = 20
  ): Promise<{ emails: EmailDocument[]; total: number }> {
    try {
      const must: any[] = [];
      const filter: any[] = [];

      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['subject', 'body'],
          },
        });
      }

      if (accountId) {
        filter.push({ term: { accountId } });
      }

      if (folder) {
        filter.push({ term: { folder } });
      }

      if (aiCategory) {
        filter.push({ term: { aiCategory } });
      }

      const searchBody: any = {
        from,
        size,
        sort: [{ date: 'desc' }],
      };

      if (must.length > 0 || filter.length > 0) {
        searchBody.query = {
          bool: {
            ...(must.length > 0 && { must }),
            ...(filter.length > 0 && { filter }),
          },
        };
      } else {
        searchBody.query = { match_all: {} };
      }

      logger.info({
        searchBody: JSON.stringify(searchBody),
        aiCategory,
        accountId,
        folder
      }, 'Elasticsearch search query');

      const result = await this.client.search({
        index: this.indexName,
        body: searchBody,
      });

      const emails = result.hits.hits.map((hit: any) => hit._source as EmailDocument);
      const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;

      logger.info({ total, emailCount: emails.length, categories: emails.map(e => e.aiCategory) }, 'Search results');

      return { emails, total };
    } catch (error) {
      logger.error({ err: error }, 'Failed to search emails');
      throw error;
    }
  }

  async getEmailById(emailId: string): Promise<EmailDocument | null> {
    try {
      const result = await this.client.get({
        index: this.indexName,
        id: emailId,
      });

      return result._source as EmailDocument;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      logger.error({ err: error }, `Failed to get email: ${emailId}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
