import { AICategory } from "../types";
export declare class EmailModel {
    id: string;
    accountId: string;
    folder: string;
    subject: string;
    body: string;
    from: string;
    to: string[];
    date: Date;
    aiCategory: AICategory;
    indexedAt: Date;
    constructor(data: {
        id: string;
        accountId: string;
        folder: string;
        subject: string;
        body: string;
        from: string;
        to: string[];
        date: Date;
        aiCategory?: AICategory;
    });
    validate(): {
        isValid: boolean;
        errors: string[];
    };
    toJSON(): {
        id: string;
        accountId: string;
        folder: string;
        subject: string;
        body: string;
        from: string;
        to: string[];
        date: Date;
        aiCategory: AICategory;
        indexedAt: Date;
    };
    static fromElasticsearch(doc: any): EmailModel;
}
//# sourceMappingURL=Email.model.d.ts.map