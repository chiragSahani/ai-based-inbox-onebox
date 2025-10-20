import { AIService } from './ai.service';
export interface ProductData {
    id: string;
    text: string;
    metadata?: Record<string, any>;
}
export declare class VectorService {
    private client;
    private aiService;
    private readonly collectionName;
    private readonly vectorSize;
    constructor(aiService: AIService);
    initialize(): Promise<void>;
    private initializeSampleData;
    storeProductData(data: ProductData): Promise<void>;
    searchSimilar(query: string, topK?: number): Promise<string[]>;
}
//# sourceMappingURL=vector.service.d.ts.map