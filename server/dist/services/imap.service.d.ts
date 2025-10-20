import { IMAPAccount } from '../types';
import { EventEmitter } from 'events';
export declare class IMAPService extends EventEmitter {
    private imap;
    private account;
    private isConnected;
    private reconnectAttempts;
    private readonly maxReconnectAttempts;
    constructor(account: IMAPAccount);
    private createIMAPConnection;
    connect(): Promise<void>;
    private handleReconnect;
    private performInitialSync;
    private fetchEmails;
    private createEmailDocument;
    disconnect(): void;
}
//# sourceMappingURL=imap.service.d.ts.map