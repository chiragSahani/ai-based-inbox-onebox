import { EmailDocument } from '../types';
export declare class ElasticsearchService {
    private client;
    private readonly indexName;
    constructor();
    initialize(): Promise<void>;
    indexEmail(email: EmailDocument): Promise<void>;
    updateEmailCategory(emailId: string, category: string): Promise<void>;
    updateEmail(emailId: string, updates: Partial<EmailDocument>): Promise<void>;
    searchEmails(params: {
        query?: any;
        accountId?: string;
        folder?: string;
        aiCategory?: string;
        from?: number;
        size?: number;
        sort?: any[];
    }): Promise<{
        emails: EmailDocument[];
        total: number;
    }>;
    getEmailById(emailId: string): Promise<EmailDocument | null>;
    rawSearch(params: {
        query: any;
        size: number;
        sort: any[];
        from: number;
    }): Promise<{
        emails: EmailDocument[];
        total: number;
    }>;
    getHealth(): Promise<any>;
    ping(): Promise<boolean>;
    close(): Promise<void>;
}
//# sourceMappingURL=elasticsearch.service.d.ts.map