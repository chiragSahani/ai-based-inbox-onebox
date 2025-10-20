"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class VectorService {
    constructor(aiService) {
        this.collectionName = 'product_data';
        this.vectorSize = 768; // text-embedding-004 produces 768-dimensional vectors
        this.client = new js_client_rest_1.QdrantClient({ url: config_1.config.qdrant.url });
        this.aiService = aiService;
    }
    async initialize() {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.some((col) => col.name === this.collectionName);
            if (!exists) {
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine',
                    },
                });
                logger_1.logger.info('Qdrant collection created successfully');
                // Initialize with some sample product data
                await this.initializeSampleData();
            }
            else {
                logger_1.logger.info('Qdrant collection already exists');
            }
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to initialize Qdrant');
            throw error;
        }
    }
    async initializeSampleData() {
        const sampleData = [
            {
                id: '1',
                text: 'ReachInbox is an AI-powered email management platform designed for sales teams, recruiters, and businesses. It automatically categorizes emails (Interested, Meeting Booked, Follow Up, Job Opportunities, etc.), suggests AI-powered replies, and helps manage inbox overflow with intelligent automation.',
                metadata: { type: 'product_overview' },
            },
            {
                id: '2',
                text: 'Pricing: Starter plan at $29/month (up to 1000 emails), Professional at $99/month (unlimited emails + priority support), Enterprise with custom pricing (dedicated account manager + SLA). All plans include 14-day free trial with no credit card required.',
                metadata: { type: 'pricing' },
            },
            {
                id: '3',
                text: `Product: ReachInbox — an AI-powered email management platform. Outreach: If lead is interested in scheduling, share the meeting booking link: ${config_1.config.webhooks.bookingLink}. Tone: friendly-professional. Available Monday-Friday, 9 AM - 6 PM EST. For urgent requests, email support@reachinbox.com`,
                metadata: { type: 'meeting_booking' },
            },
            {
                id: '4',
                text: 'Core Features: (1) Real-time IMAP email sync from Gmail, Outlook, and custom servers. (2) AI categorization with 10+ categories including Interested, Follow Up, Job Opportunities, Important, Newsletter. (3) Smart reply suggestions using advanced RAG (Retrieval Augmented Generation). (4) Full-text search powered by Elasticsearch. (5) Webhook integrations with Slack, Teams, and custom APIs.',
                metadata: { type: 'features' },
            },
            {
                id: '5',
                text: 'Integrations: Native support for Slack notifications, Microsoft Teams, Webhook.site for testing, and custom webhooks. REST API available for developers. SDKs for Python, JavaScript, and Go. Zapier integration coming soon.',
                metadata: { type: 'integrations' },
            },
            {
                id: '6',
                text: 'For job seekers and recruiters: ReachInbox automatically identifies job opportunities, recruitment emails, interview requests, and follow-ups. Perfect for managing multiple job applications and staying organized during your job search.',
                metadata: { type: 'job_seekers' },
            },
            {
                id: '7',
                text: 'Security & Privacy: All emails are encrypted at rest and in transit. We never share your data with third parties. SOC 2 Type II certified. GDPR and CCPA compliant. Self-hosted option available for enterprises.',
                metadata: { type: 'security' },
            },
            {
                id: '8',
                text: 'For technical questions or support: Email our engineering team at tech@reachinbox.com. Response time: < 2 hours for Pro/Enterprise, < 24 hours for Starter. Live chat available for Enterprise customers.',
                metadata: { type: 'support' },
            },
        ];
        for (const data of sampleData) {
            await this.storeProductData(data);
        }
        logger_1.logger.info('Sample product data initialized');
    }
    async storeProductData(data) {
        try {
            const embedding = await this.aiService.generateEmbedding(data.text);
            await this.client.upsert(this.collectionName, {
                points: [
                    {
                        id: parseInt(data.id, 10),
                        vector: embedding,
                        payload: {
                            text: data.text,
                            ...data.metadata,
                        },
                    },
                ],
            });
            logger_1.logger.info(`Product data stored: ${data.id}`);
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Failed to store product data: ${data.id}`);
            throw error;
        }
    }
    async searchSimilar(query, topK = 3) {
        try {
            const queryEmbedding = await this.aiService.generateEmbedding(query);
            const searchResult = await this.client.search(this.collectionName, {
                vector: queryEmbedding,
                limit: topK,
            });
            const contexts = searchResult.map((result) => {
                const payload = result.payload;
                return payload.text;
            });
            logger_1.logger.info(`Found ${contexts.length} similar contexts for query`);
            return contexts;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to search similar contexts');
            throw error;
        }
    }
}
exports.VectorService = VectorService;
//# sourceMappingURL=vector.service.js.map