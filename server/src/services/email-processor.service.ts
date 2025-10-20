import { EmailDocument } from '../types';
import { ElasticsearchService } from './elasticsearch.service';
import { AIService } from './ai.service';
import { WebhookService } from './webhook.service';
import { logger } from '../utils/logger';

export class EmailProcessorService {
  private processingQueue: EmailDocument[] = [];
  private isProcessing: boolean = false;
  private readonly DELAY_BETWEEN_API_CALLS = 4000; // 4 seconds delay = 15 calls per minute

  constructor(
    private esService: ElasticsearchService,
    private aiService: AIService,
    private webhookService: WebhookService
  ) {
    // Start the background processor
    this.startBackgroundProcessor();
  }

  async processEmail(email: EmailDocument): Promise<void> {
    try {
      logger.info(`Processing email: ${email.id} from ${email.from}`);

      // Check if email already exists in Elasticsearch
      const existingEmail = await this.esService.getEmailById(email.id);

      if (existingEmail) {
        logger.info(`Email already processed and categorized: ${email.id} (Category: ${existingEmail.aiCategory})`);
        return;
      }

      // Step 1: Index the email in Elasticsearch first (with default category)
      await this.esService.indexEmail(email);

      // Step 2: Add to queue for AI categorization (with rate limiting)
      this.processingQueue.push(email);
      logger.info(`Email indexed and queued for categorization: ${email.id} (Queue size: ${this.processingQueue.length})`);

    } catch (error) {
      logger.error({ err: error }, `Failed to process email: ${email.id}`);
      throw error;
    }
  }

  private async startBackgroundProcessor(): Promise<void> {
    // Process queue continuously with delays
    setInterval(async () => {
      if (this.isProcessing || this.processingQueue.length === 0) {
        return;
      }

      this.isProcessing = true;

      try {
        const email = this.processingQueue.shift();
        if (!email) {
          this.isProcessing = false;
          return;
        }

        logger.info(`Categorizing email from queue: ${email.id} (${this.processingQueue.length} remaining)`);

        // Call Gemini API with delay
        const category = await this.aiService.categorizeEmail(email.subject, email.body);

        // Update the category in Elasticsearch
        await this.esService.updateEmailCategory(email.id, category);

        // Trigger webhooks if category is "Interested"
        if (category === 'Interested') {
          logger.info(`Interested lead detected: ${email.id}`);
          await this.webhookService.notifyInterested(email);
        }

        logger.info(`Email categorized: ${email.id} (Category: ${category})`);

        // Wait before processing next email to avoid rate limits
        await this.delay(this.DELAY_BETWEEN_API_CALLS);

      } catch (error) {
        logger.error({ err: error }, 'Failed to categorize email from queue');
      } finally {
        this.isProcessing = false;
      }
    }, 500); // Check queue every 500ms
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
