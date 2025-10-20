import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config';
import { AI } from '../config/constants';
import { SAMPLE_PRODUCT_DATA, ProductData } from '../config/seed-data';
import { logger } from '../utils/logger';
import { AIService } from './ai.service';

export class VectorService {
  private client: QdrantClient;
  private aiService: AIService;
  private readonly collectionName = 'product_data';
  private readonly vectorSize = AI.VECTOR_DIMENSION;

  constructor(aiService: AIService) {
    this.client = new QdrantClient({ url: config.qdrant.url });
    this.aiService = aiService;
  }

  async initialize(): Promise<void> {
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
        logger.info('Qdrant collection created successfully');

        await this.initializeSampleData();
      } else {
        logger.info('Qdrant collection already exists');
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize Qdrant');
      throw error;
    }
  }

  private async initializeSampleData(): Promise<void> {
    for (const data of SAMPLE_PRODUCT_DATA) {
      await this.storeProductData(data);
    }

    logger.info('Sample product data initialized');
  }

  async storeProductData(data: ProductData): Promise<void> {
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

      logger.info(`Product data stored: ${data.id}`);
    } catch (error) {
      logger.error({ err: error }, `Failed to store product data: ${data.id}`);
      throw error;
    }
  }

  async searchSimilar(query: string, topK: number = AI.DEFAULT_TOP_K): Promise<string[]> {
    try {
      const queryEmbedding = await this.aiService.generateEmbedding(query);

      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: topK,
      });

      const contexts = searchResult.map((result) => {
        const payload = result.payload as { text: string };
        return payload.text;
      });

      logger.info(`Found ${contexts.length} similar contexts for query`);
      return contexts;
    } catch (error) {
      logger.error({ err: error }, 'Failed to search similar contexts');
      throw error;
    }
  }
}
