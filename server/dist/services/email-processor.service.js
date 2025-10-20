"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessorService = void 0;
const logger_1 = require("../utils/logger");
class EmailProcessorService {
    constructor(esService, aiService, webhookService) {
        this.esService = esService;
        this.aiService = aiService;
        this.webhookService = webhookService;
        this.processingQueue = [];
        this.isProcessing = false;
        this.DELAY_BETWEEN_API_CALLS = 4000; // 4 seconds delay = 15 calls per minute
        // Start the background processor
        this.startBackgroundProcessor();
    }
    async processEmail(email) {
        try {
            logger_1.logger.info(`Processing email: ${email.id} from ${email.from}`);
            // Check if email already exists in Elasticsearch
            const existingEmail = await this.esService.getEmailById(email.id);
            if (existingEmail) {
                logger_1.logger.info(`Email already processed and categorized: ${email.id} (Category: ${existingEmail.aiCategory})`);
                return;
            }
            // Step 1: Index the email in Elasticsearch first (with default category)
            await this.esService.indexEmail(email);
            // Step 2: Add to queue for AI categorization (with rate limiting)
            this.processingQueue.push(email);
            logger_1.logger.info(`Email indexed and queued for categorization: ${email.id} (Queue size: ${this.processingQueue.length})`);
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Failed to process email: ${email.id}`);
            throw error;
        }
    }
    async startBackgroundProcessor() {
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
                logger_1.logger.info(`Categorizing email from queue: ${email.id} (${this.processingQueue.length} remaining)`);
                // Call Gemini API with delay
                const category = await this.aiService.categorizeEmail(email.subject, email.body);
                // Update the category in Elasticsearch
                await this.esService.updateEmailCategory(email.id, category);
                // Trigger webhooks if category is "Interested"
                if (category === 'Interested') {
                    logger_1.logger.info(`Interested lead detected: ${email.id}`);
                    await this.webhookService.notifyInterested(email);
                }
                logger_1.logger.info(`Email categorized: ${email.id} (Category: ${category})`);
                // Wait before processing next email to avoid rate limits
                await this.delay(this.DELAY_BETWEEN_API_CALLS);
            }
            catch (error) {
                logger_1.logger.error({ err: error }, 'Failed to categorize email from queue');
            }
            finally {
                this.isProcessing = false;
            }
        }, 500); // Check queue every 500ms
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EmailProcessorService = EmailProcessorService;
//# sourceMappingURL=email-processor.service.js.map