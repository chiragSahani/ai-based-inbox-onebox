import { EmailDocument } from '../types';
export declare class WebhookService {
    private sentWebhooks;
    notifyInterested(email: EmailDocument): Promise<void>;
    private sendSlackNotification;
    private sendGenericWebhook;
}
//# sourceMappingURL=webhook.service.d.ts.map