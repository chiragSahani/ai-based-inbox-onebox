import { Request, Response } from "express";
import { ElasticsearchService } from "../services/elasticsearch.service";
import { VectorService } from "../services/vector.service";
import { AIService } from "../services/ai.service";
export declare class EmailController {
    private esService;
    private vectorService;
    private aiService;
    constructor(esService: ElasticsearchService, vectorService: VectorService, aiService: AIService);
    getEmails: (req: Request, res: Response, next: import("express").NextFunction) => void;
    searchEmails: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getEmailById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    suggestReply: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=email.controller.d.ts.map