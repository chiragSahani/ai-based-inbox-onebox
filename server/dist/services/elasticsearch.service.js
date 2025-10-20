"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class ElasticsearchService {
    constructor() {
        this.indexName = 'emails';
        this.client = new elasticsearch_1.Client({ node: config_1.config.elasticsearch.url });
    }
    async initialize() {
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
                logger_1.logger.info('Elasticsearch index created successfully');
            }
            else {
                logger_1.logger.info('Elasticsearch index already exists');
            }
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to initialize Elasticsearch');
            throw error;
        }
    }
    async indexEmail(email) {
        try {
            await this.client.index({
                index: this.indexName,
                id: email.id,
                document: email,
            });
            logger_1.logger.info(`Email indexed: ${email.id}`);
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Failed to index email: ${email.id}`);
            throw error;
        }
    }
    async updateEmailCategory(emailId, category) {
        try {
            await this.client.update({
                index: this.indexName,
                id: emailId,
                doc: {
                    aiCategory: category,
                },
            });
            logger_1.logger.info(`Email category updated: ${emailId} -> ${category}`);
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Failed to update email category: ${emailId}`);
            throw error;
        }
    }
    async searchEmails(query, accountId, folder, aiCategory, from = 0, size = 20) {
        try {
            const must = [];
            const filter = [];
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
            const searchBody = {
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
            }
            else {
                searchBody.query = { match_all: {} };
            }
            logger_1.logger.info({
                searchBody: JSON.stringify(searchBody),
                aiCategory,
                accountId,
                folder
            }, 'Elasticsearch search query');
            const result = await this.client.search({
                index: this.indexName,
                body: searchBody,
            });
            const emails = result.hits.hits.map((hit) => hit._source);
            const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;
            logger_1.logger.info({ total, emailCount: emails.length, categories: emails.map(e => e.aiCategory) }, 'Search results');
            return { emails, total };
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to search emails');
            throw error;
        }
    }
    async getEmailById(emailId) {
        try {
            const result = await this.client.get({
                index: this.indexName,
                id: emailId,
            });
            return result._source;
        }
        catch (error) {
            if (error.meta?.statusCode === 404) {
                return null;
            }
            logger_1.logger.error({ err: error }, `Failed to get email: ${emailId}`);
            throw error;
        }
    }
    async close() {
        await this.client.close();
    }
}
exports.ElasticsearchService = ElasticsearchService;
//# sourceMappingURL=elasticsearch.service.js.map