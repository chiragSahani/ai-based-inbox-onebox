import { IMAPAccount } from "../types";
export declare const config: {
    port: number;
    nodeEnv: string;
    features: {
        elasticsearch: boolean;
        vectorDB: boolean;
        aiLabeling: boolean;
        webhooks: boolean;
        realtime: boolean;
    };
    elasticsearch: {
        url: string;
    };
    qdrant: {
        url: string;
    };
    gemini: {
        apiKey: string;
    };
    webhooks: {
        slack: string;
        generic: string;
        bookingLink: string;
    };
    rateLimit: {
        geminiCallsPerMinute: number;
    };
};
export declare function getIMAPAccounts(): IMAPAccount[];
//# sourceMappingURL=index.d.ts.map