"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class WebhookService {
    constructor() {
        // Track sent webhooks for idempotency (dedupe by message-id)
        this.sentWebhooks = new Set();
    }
    async notifyInterested(email) {
        try {
            // Check feature flag
            if (!config_1.config.features.webhooks) {
                logger_1.logger.info('Webhooks disabled via feature flag');
                return;
            }
            // Idempotent check: prevent duplicate webhooks for same email
            const eventId = `interested_${email.id}`;
            if (this.sentWebhooks.has(eventId)) {
                logger_1.logger.info(`Webhook already sent for email: ${email.id}, skipping...`);
                return;
            }
            // Send Slack notification
            await this.sendSlackNotification(email, eventId);
            // Send generic webhook
            await this.sendGenericWebhook(email, eventId);
            // Mark as sent
            this.sentWebhooks.add(eventId);
            // Clean up old entries (keep last 10000)
            if (this.sentWebhooks.size > 10000) {
                const entries = Array.from(this.sentWebhooks);
                this.sentWebhooks = new Set(entries.slice(-5000));
            }
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to send webhook notifications');
        }
    }
    async sendSlackNotification(email, eventId) {
        if (!config_1.config.webhooks.slack) {
            logger_1.logger.warn('Slack webhook URL not configured');
            return;
        }
        try {
            const payload = {
                text: `🎯 New Interested Lead!`,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '🎯 New Interested Lead Detected',
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*From:*\n${email.from}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Subject:*\n${email.subject}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Account:*\n${email.accountId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Date:*\n${new Date(email.date).toLocaleString()}`,
                            },
                        ],
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Preview:*\n${email.body.substring(0, 200)}${email.body.length > 200 ? '...' : ''}`,
                        },
                    },
                ],
            };
            const response = await fetch(config_1.config.webhooks.slack, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`Slack webhook failed: ${response.statusText}`);
            }
            logger_1.logger.info('Slack notification sent successfully');
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to send Slack notification');
        }
    }
    async sendGenericWebhook(email, eventId) {
        if (!config_1.config.webhooks.generic) {
            logger_1.logger.warn('Generic webhook URL not configured');
            return;
        }
        try {
            const payload = {
                event: 'InterestedLead',
                event_id: eventId, // For idempotency
                timestamp: new Date().toISOString(),
                email: {
                    id: email.id,
                    from: email.from,
                    to: email.to,
                    subject: email.subject,
                    body: email.body,
                    date: email.date,
                    accountId: email.accountId,
                    category: email.aiCategory,
                },
            };
            const response = await fetch(config_1.config.webhooks.generic, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`Generic webhook failed: ${response.statusText}`);
            }
            logger_1.logger.info('Generic webhook sent successfully');
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to send generic webhook');
        }
    }
}
exports.WebhookService = WebhookService;
//# sourceMappingURL=webhook.service.js.map