"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai_service_1 = require("../services/ai.service");
const elasticsearch_service_1 = require("../services/elasticsearch.service");
const logger_1 = require("../utils/logger");
const BATCH_SIZE = 10000;
const DELAY_BETWEEN_CALLS = 4000;
const aiService = new ai_service_1.AIService();
const esService = new elasticsearch_service_1.ElasticsearchService();
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function recategorizeAllEmails() {
    try {
        logger_1.logger.info('Starting email recategorization...');
        const result = await esService.searchEmails({
            query: { match_all: {} },
            size: BATCH_SIZE,
            sort: [{ date: 'desc' }],
        });
        const emails = result.emails;
        logger_1.logger.info(`Found ${emails.length} emails to recategorize`);
        let processed = 0;
        for (const email of emails) {
            try {
                logger_1.logger.info(`Processing ${processed + 1}/${emails.length}: ${email.id}`);
                const newCategory = await aiService.categorizeEmail(email.subject || '', email.body || '');
                await esService.updateEmail(email.id, { aiCategory: newCategory });
                logger_1.logger.info(`✓ Email ${email.id} recategorized: ${email.aiCategory} → ${newCategory}`);
                processed++;
                if (processed < emails.length) {
                    logger_1.logger.info(`Waiting ${DELAY_BETWEEN_CALLS}ms before next call (${processed}/${emails.length})...`);
                    await delay(DELAY_BETWEEN_CALLS);
                }
            }
            catch (error) {
                logger_1.logger.error({ err: error }, `Failed to recategorize email: ${email.id}`);
            }
        }
        logger_1.logger.info(`✓ Recategorization complete! Processed ${processed}/${emails.length} emails`);
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Recategorization failed');
        process.exit(1);
    }
}
recategorizeAllEmails();
//# sourceMappingURL=recategorize-emails.js.map