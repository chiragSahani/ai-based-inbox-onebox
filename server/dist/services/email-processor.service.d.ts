import { EmailDocument } from '../types';
import { ElasticsearchService } from './elasticsearch.service';
import { AIService } from './ai.service';
import { WebhookService } from './webhook.service';
export declare class EmailProcessorService {
    private esService;
    private aiService;
    private webhookService;
    private processingQueue;
    private isProcessing;
    private readonly DELAY_BETWEEN_API_CALLS;
    constructor(esService: ElasticsearchService, aiService: AIService, webhookService: WebhookService);
    processEmail(email: EmailDocument): Promise<void>;
    private startBackgroundProcessor;
    private delay;
}
//# sourceMappingURL=email-processor.service.d.ts.map