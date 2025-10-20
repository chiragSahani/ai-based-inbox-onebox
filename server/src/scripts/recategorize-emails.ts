import { AIService } from '../services/ai.service';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { logger } from '../utils/logger';

const BATCH_SIZE = 10000;
const DELAY_BETWEEN_CALLS = 4000;

const aiService = new AIService();
const esService = new ElasticsearchService();

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recategorizeAllEmails() {
  try {
    logger.info('Starting email recategorization...');

    const result = await esService.searchEmails({
      query: { match_all: {} },
      size: BATCH_SIZE,
      sort: [{ date: 'desc' }],
    });

    const emails = result.emails;

    logger.info(`Found ${emails.length} emails to recategorize`);

    let processed = 0;

    for (const email of emails) {
      try {
        logger.info(`Processing ${processed + 1}/${emails.length}: ${email.id}`);

        const newCategory = await aiService.categorizeEmail(email.subject || '', email.body || '');

        await esService.updateEmail(email.id, { aiCategory: newCategory });

        logger.info(`✓ Email ${email.id} recategorized: ${email.aiCategory} → ${newCategory}`);

        processed++;

        if (processed < emails.length) {
          logger.info(`Waiting ${DELAY_BETWEEN_CALLS}ms before next call (${processed}/${emails.length})...`);
          await delay(DELAY_BETWEEN_CALLS);
        }
      } catch (error) {
        logger.error({ err: error }, `Failed to recategorize email: ${email.id}`);
      }
    }

    logger.info(`✓ Recategorization complete! Processed ${processed}/${emails.length} emails`);
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Recategorization failed');
    process.exit(1);
  }
}

recategorizeAllEmails();
