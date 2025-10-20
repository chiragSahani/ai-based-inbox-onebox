import express from 'express';
import { config, getIMAPAccounts } from './config';
import { logger } from './utils/logger';
import { ElasticsearchService } from './services/elasticsearch.service';
import { AIService } from './services/ai.service';
import { VectorService } from './services/vector.service';
import { WebhookService } from './services/webhook.service';
import { IMAPService } from './services/imap.service';
import { EmailProcessorService } from './services/email-processor.service';
import { NotificationService } from './services/notification.service';

// Import middlewares
import {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  sanitizeRequest,
  securityHeaders,
} from './middlewares/security.middleware';
// import { apiLimiter } from './middlewares/ratelimit.middleware';
import { errorHandler, notFound, handleUncaughtException, handleUnhandledRejection } from './middlewares/error.middleware';
import { httpLogger, requestId, performanceMonitor } from './middlewares/logger.middleware';

// Import routes
import { createEmailRoutes } from './api/email.routes';
import { createAccountRoutes } from './api/account.routes';
import { createHealthRoutes } from './api/health.routes';
import { createNotificationRoutes } from './api/notification.routes';

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

class Application {
  private app: express.Application;
  private esService: ElasticsearchService;
  private aiService: AIService;
  private vectorService: VectorService;
  private webhookService: WebhookService;
  private notificationService: NotificationService;
  private emailProcessor: EmailProcessorService;
  private imapServices: IMAPService[] = [];

  constructor() {
    this.app = express();
    this.esService = new ElasticsearchService();
    this.aiService = new AIService();
    this.vectorService = new VectorService(this.aiService);
    this.webhookService = new WebhookService();
    this.notificationService = new NotificationService();
    this.emailProcessor = new EmailProcessorService(this.esService, this.aiService, this.webhookService);
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing application...');

      // Initialize Elasticsearch
      await this.esService.initialize();

      // Initialize Vector Database
      await this.vectorService.initialize();

      // Security middleware (MUST be first)
      this.app.use(helmetMiddleware);
      this.app.use(securityHeaders);
      this.app.use(corsMiddleware);
      this.app.use(compressionMiddleware);

      // Request processing middleware
      this.app.use(express.json({ limit: '10mb' }));
      this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      this.app.use(sanitizeRequest);

      // Logging middleware
      this.app.use(requestId);
      this.app.use(httpLogger);
      this.app.use(performanceMonitor);

      // Trust proxy (for rate limiting behind load balancer)
      this.app.set('trust proxy', 1);

      // API rate limiting - DISABLED
      // this.app.use('/api', apiLimiter);

      // Health check routes (no rate limit)
      const healthRoutes = createHealthRoutes(this.esService);
      this.app.use('/api/health', healthRoutes);

      // Account routes
      const accountRoutes = createAccountRoutes();
      this.app.use('/api/accounts', accountRoutes);

      // Email routes
      const emailRoutes = createEmailRoutes(this.esService, this.vectorService, this.aiService);
      this.app.use('/api/emails', emailRoutes);

      // Notification routes
      const notificationRoutes = createNotificationRoutes(this.notificationService);
      this.app.use('/api/notifications', notificationRoutes);

      // Root endpoint
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
      this.app.use(notFound);

      // Global error handler (MUST be last)
      this.app.use(errorHandler);

      // Initialize IMAP connections
      await this.initializeIMAPConnections();

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize application');
      throw error;
    }
  }

  private async initializeIMAPConnections(): Promise<void> {
    const accounts = getIMAPAccounts();

    if (accounts.length === 0) {
      logger.warn('No IMAP accounts configured. Please set up IMAP credentials in .env file.');
      return;
    }

    for (const account of accounts) {
      try {
        const imapService = new IMAPService(account);

        // Listen for new emails
        imapService.on('email', async (email) => {
          try {
            await this.emailProcessor.processEmail(email);
            this.notificationService.notifyNewEmail(
              email.from,
              email.subject || '(No Subject)',
              email.id
            );
          } catch (error) {
            logger.error({ err: error }, 'Failed to process email from IMAP');
          }
        });

        // Connect to IMAP
        await imapService.connect();
        this.imapServices.push(imapService);

        logger.info(`IMAP service started for: ${account.user}`);
      } catch (error) {
        logger.error({ err: error }, `Failed to initialize IMAP for ${account.user}`);
      }
    }
  }

  async start(): Promise<void> {
    const server = this.app.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════╗
║  ReachInbox AI Email Onebox - Server Started              ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(46)}║
║  Port: ${config.port.toString().padEnd(52)}║
║  Server: http://localhost:${config.port.toString().padEnd(37)}║
║  Health: http://localhost:${config.port}/api/health${' '.padEnd(21)}║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');

      server.close(() => {
        logger.info('HTTP server closed');
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
  } catch (error) {
    logger.error({ err: error }, 'Fatal error');
    process.exit(1);
  }
})();
