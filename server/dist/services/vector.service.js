"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const config_1 = require("../config");
const constants_1 = require("../config/constants");
const seed_data_1 = require("../config/seed-data");
const logger_1 = require("../utils/logger");
class VectorService {
    constructor(aiService) {
        this.collectionName = 'product_data';
        this.vectorSize = constants_1.AI.VECTOR_DIMENSION;
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
        for (const data of seed_data_1.SAMPLE_PRODUCT_DATA) {
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
    async searchSimilar(query, topK = constants_1.AI.DEFAULT_TOP_K) {
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