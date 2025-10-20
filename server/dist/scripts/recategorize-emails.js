"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
// Initialize services
const esClient = new elasticsearch_1.Client({ node: config_1.config.elasticsearch.url });
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.apiKey);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: 'You are an expert email classifier. Analyze the email content carefully and categorize it into ONE of these categories. Read the ENTIRE email before deciding.\n\n' +
        'CATEGORIES (choose the BEST match):\n\n' +
        '1. Interested - Positive responses showing genuine interest:\n' +
        '   - Asking questions about your product/service\n' +
        '   - Requesting more information, pricing, demo\n' +
        '   - Expressing curiosity or openness to learn more\n' +
        '   - "Sounds interesting", "Tell me more", "I\'d like to know"\n\n' +
        '2. Meeting Booked - Confirmed scheduled meetings:\n' +
        '   - Calendar invites or meeting confirmations\n' +
        '   - Specific date/time for a call or meeting\n' +
        '   - "Let\'s meet on Tuesday at 3pm"\n' +
        '   - Zoom/Teams meeting links with scheduled time\n\n' +
        '3. Not Interested - Clear rejections:\n' +
        '   - "Not interested", "No thank you"\n' +
        '   - "Not a good fit", "Not right now"\n' +
        '   - Polite but firm rejections\n' +
        '   - "Please remove me from your list"\n\n' +
        '4. Follow Up - Requires a response but not urgent:\n' +
        '   - Checking in on previous conversation\n' +
        '   - Reminder emails about pending items\n' +
        '   - "Just following up", "Circling back"\n' +
        '   - Questions that need answers\n\n' +
        '5. Job Opportunity - Jobs, recruitment, career:\n' +
        '   - Job postings and descriptions\n' +
        '   - Recruitment messages\n' +
        '   - Career opportunities\n' +
        '   - Interview invitations\n' +
        '   - LinkedIn InMail about jobs\n\n' +
        '6. Newsletter - Marketing and promotional content:\n' +
        '   - Company updates and announcements\n' +
        '   - Product launches\n' +
        '   - Marketing emails with unsubscribe links\n' +
        '   - Blog posts, articles, webinars\n' +
        '   - Promotional offers\n\n' +
        '7. Spam - Unsolicited or irrelevant:\n' +
        '   - Mass emails from unknown senders\n' +
        '   - Suspicious links or attachments\n' +
        '   - Scam attempts, phishing\n' +
        '   - Completely irrelevant to recipient\n' +
        '   - Too good to be true offers\n\n' +
        '8. Out of Office - Automated absence replies:\n' +
        '   - "I am out of office"\n' +
        '   - Vacation auto-replies\n' +
        '   - "I will return on..."\n' +
        '   - Limited email access notices\n\n' +
        '9. Important - Urgent, time-sensitive:\n' +
        '   - Marked as urgent or high priority\n' +
        '   - From CEO, management, key clients\n' +
        '   - Contract deadlines, critical issues\n' +
        '   - "URGENT", "ASAP", "Action Required"\n\n' +
        '10. Informational - FYI, no action needed:\n' +
        '   - Status updates\n' +
        '   - General information sharing\n' +
        '   - Team announcements\n' +
        '   - "FYI", "For your information"\n' +
        '   - System notifications\n\n' +
        'IMPORTANT RULES:\n' +
        '- Read the FULL email before categorizing\n' +
        '- If email mentions jobs/careers/hiring → Job Opportunity\n' +
        '- If from Slack/Teams/internal tools → Informational (unless urgent)\n' +
        '- If automated system message → Informational\n' +
        '- Only use Spam for truly unsolicited/suspicious emails\n' +
        '- When in doubt between categories, pick the MOST specific one\n' +
        '- Marketing emails with products/services → Newsletter, NOT Spam\n' +
        '- GitHub/GitLab notifications → Informational\n' +
        '- Slack channel messages → Informational',
    generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    enum: ['Interested', 'Meeting Booked', 'Not Interested', 'Follow Up', 'Job Opportunity', 'Newsletter', 'Spam', 'Out of Office', 'Important', 'Informational'],
                },
            },
            required: ['category'],
        },
    },
});
const validCategories = [
    'Interested',
    'Meeting Booked',
    'Not Interested',
    'Follow Up',
    'Job Opportunity',
    'Newsletter',
    'Spam',
    'Out of Office',
    'Important',
    'Informational',
    'Uncategorized'
];
async function categorizeEmail(subject, body) {
    try {
        const emailText = `Subject: ${subject}\n\nBody: ${body}`;
        const response = await model.generateContent(emailText);
        const result = response.response.text();
        const parsed = JSON.parse(result);
        const category = validCategories.includes(parsed.category) ? parsed.category : 'Uncategorized';
        return category;
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Failed to categorize email');
        return 'Uncategorized';
    }
}
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function recategorizeAllEmails() {
    try {
        logger_1.logger.info('Starting email recategorization...');
        // Fetch all emails from Elasticsearch
        const result = await esClient.search({
            index: 'emails',
            query: { match_all: {} },
            size: 10000, // Adjust based on your total emails
            sort: [{ date: 'desc' }],
        });
        const emails = result.hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
        }));
        logger_1.logger.info(`Found ${emails.length} emails to recategorize`);
        let processed = 0;
        const DELAY_BETWEEN_CALLS = 4000; // 4 seconds = 15 calls per minute
        for (const email of emails) {
            try {
                logger_1.logger.info(`Processing ${processed + 1}/${emails.length}: ${email.id}`);
                // Categorize email
                const newCategory = await categorizeEmail(email.subject || '', email.body || '');
                // Update in Elasticsearch
                await esClient.update({
                    index: 'emails',
                    id: email.id,
                    doc: {
                        aiCategory: newCategory,
                    },
                });
                logger_1.logger.info(`✓ Email ${email.id} recategorized: ${email.aiCategory} → ${newCategory}`);
                processed++;
                // Wait 4 seconds before next API call to respect rate limit
                if (processed < emails.length) {
                    logger_1.logger.info(`Waiting 4 seconds before next call (${processed}/${emails.length})...`);
                    await delay(DELAY_BETWEEN_CALLS);
                }
            }
            catch (error) {
                logger_1.logger.error({ err: error }, `Failed to recategorize email: ${email.id}`);
                // Continue with next email
            }
        }
        logger_1.logger.info(`✓ Recategorization complete! Processed ${processed}/${emails.length} emails`);
        await esClient.close();
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Recategorization failed');
        await esClient.close();
        process.exit(1);
    }
}
// Run the script
recategorizeAllEmails();
//# sourceMappingURL=recategorize-emails.js.map