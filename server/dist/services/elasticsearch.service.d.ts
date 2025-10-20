import { EmailDocument } from '../types';
export declare class ElasticsearchService {
    private client;
    private readonly indexName;
    constructor();
    initialize(): Promise<void>;
    indexEmail(email: EmailDocument): Promise<void>;
    updateEmailCategory(emailId: string, category: string): Promise<void>;
    searchEmails(query?: string, accountId?: string, folder?: string, aiCategory?: string, from?: number, size?: number): Promise<{
        emails: EmailDocument[];
        total: number;
    }>;
    getEmailById(emailId: string): Promise<EmailDocument | null>;
    close(): Promise<void>;
}
//# sourceMappingURL=elasticsearch.service.d.ts.map