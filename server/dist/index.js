"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const elasticsearch_service_1 = require("./services/elasticsearch.service");
const ai_service_1 = require("./services/ai.service");
const vector_service_1 = require("./services/vector.service");
const webhook_service_1 = require("./services/webhook.service");
const imap_service_1 = require("./services/imap.service");
const email_processor_service_1 = require("./services/email-processor.service");
const notification_service_1 = require("./services/notification.service");
// Import middlewares
const security_middleware_1 = require("./middlewares/security.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
// Import routes
const email_routes_1 = require("./api/email.routes");
const account_routes_1 = require("./api/account.routes");
const health_routes_1 = require("./api/health.routes");
const notification_routes_1 = require("./api/notification.routes");
// Handle uncaught exceptions and unhandled rejections
(0, error_middleware_1.handleUncaughtException)();
(0, error_middleware_1.handleUnhandledRejection)();
class Application {
    constructor() {
        this.imapServices = [];
        this.app = (0, express_1.default)();
        this.esService = new elasticsearch_service_1.ElasticsearchService();
        this.aiService = new ai_service_1.AIService();
        this.vectorService = new vector_service_1.VectorService(this.aiService);
        this.webhookService = new webhook_service_1.WebhookService();
        this.notificationService = new notification_service_1.NotificationService();
        this.emailProcessor = new email_processor_service_1.EmailProcessorService(this.esService, this.aiService, this.webhookService);
    }
    async initialize() {
        try {
            logger_1.logger.info('Initializing application...');
            // Initialize Elasticsearch
            await this.esService.initialize();
            // Initialize Vector Database
            await this.vectorService.initialize();
            // Security middleware (MUST be first)
            this.app.use(security_middleware_1.helmetMiddleware);
            this.app.use(security_middleware_1.securityHeaders);
            this.app.use(security_middleware_1.corsMiddleware);
            this.app.use(security_middleware_1.compressionMiddleware);
            // Request processing middleware
            this.app.use(express_1.default.json({ limit: '10mb' }));
            this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
            this.app.use(security_middleware_1.sanitizeRequest);
            // Logging middleware
            this.app.use(logger_middleware_1.requestId);
            this.app.use(logger_middleware_1.httpLogger);
            this.app.use(logger_middleware_1.performanceMonitor);
            this.app.set('trust proxy', 1);
            this.app.use('/api/health', (0, health_routes_1.createHealthRoutes)(this.esService));
            this.app.use('/api/accounts', (0, account_routes_1.createAccountRoutes)());
            this.app.use('/api/emails', (0, email_routes_1.createEmailRoutes)(this.esService, this.vectorService, this.aiService));
            this.app.use('/api/notifications', (0, notification_routes_1.createNotificationRoutes)(this.notificationService));
            this.app.get('/', (req, res) => {
                res.json({
                    success: true,
                    message: 'ReachInbox AI Email Onebox API',
                    version: '1.0.0',
                    endpoints: {
                        health: '/api/health',
                        accounts: '/api/accounts',
                        emails: '/api/emails',
                        search: '/api/emails/search',
                        notifications: '/api/notifications',
                    },
                });
            });
            // 404 handler
            this.app.use(error_middleware_1.notFound);
            // Global error handler (MUST be last)
            this.app.use(error_middleware_1.errorHandler);
            // Initialize IMAP connections
            await this.initializeIMAPConnections();
            logger_1.logger.info('Application initialized successfully');
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to initialize application');
            throw error;
        }
    }
    async initializeIMAPConnections() {
        const accounts = (0, config_1.getIMAPAccounts)();
        if (accounts.length === 0) {
            logger_1.logger.warn('No IMAP accounts configured. Please set up IMAP credentials in .env file.');
            return;
        }
        for (const account of accounts) {
            try {
                const imapService = new imap_service_1.IMAPService(account);
                // Listen for new emails
                imapService.on('email', async (email) => {
                    try {
                        await this.emailProcessor.processEmail(email);
                        this.notificationService.notifyNewEmail(email.from, email.subject || '(No Subject)', email.id);
                    }
                    catch (error) {
                        logger_1.logger.error({ err: error }, 'Failed to process email from IMAP');
                    }
                });
                // Connect to IMAP
                await imapService.connect();
                this.imapServices.push(imapService);
                logger_1.logger.info(`IMAP service started for: ${account.user}`);
            }
            catch (error) {
                logger_1.logger.error({ err: error }, `Failed to initialize IMAP for ${account.user}`);
            }
        }
    }
    async start() {
        const server = this.app.listen(config_1.config.port, () => {
            logger_1.logger.info(`
╔════════════════════════════════════════════════════════════╗
║  ReachInbox AI Email Onebox - Server Started              ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(46)}║
║  Port: ${config_1.config.port.toString().padEnd(52)}║
║  Server: http://localhost:${config_1.config.port.toString().padEnd(37)}║
║  Health: http://localhost:${config_1.config.port}/api/health${' '.padEnd(21)}║
╚════════════════════════════════════════════════════════════╝
      `);
        });
        // Graceful shutdown
        const shutdown = async () => {
            logger_1.logger.info('Shutting down gracefully...');
            server.close(() => {
                logger_1.logger.info('HTTP server closed');
            });
            // Disconnect all IMAP services
            for (const imapService of this.imapServices) {
                imapService.disconnect();
            }
            // Close Elasticsearch connection
            await this.esService.close();
            process.exit(0);
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
}
// Main execution
(async () => {
    try {
        const app = new Application();
        await app.initialize();
        await app.start();
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Fatal error');
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map