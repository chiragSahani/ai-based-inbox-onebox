import { AICategory } from "../types";
export declare class AIService {
    private genAI;
    private model;
    constructor();
    categorizeEmail(subject: string, body: string): Promise<AICategory>;
    generateEmbedding(text: string): Promise<number[]>;
    generateReply(originalEmail: string, context: string[]): Promise<string>;
}
//# sourceMappingURL=ai.service.d.ts.map