import { Request, Response } from "express";
import { ElasticsearchService } from "../services/elasticsearch.service";
export declare class HealthController {
    private esService;
    constructor(esService: ElasticsearchService);
    healthCheck: (req: Request, res: Response, next: import("express").NextFunction) => void;
    detailedHealthCheck: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readinessCheck: (req: Request, res: Response, next: import("express").NextFunction) => void;
    livenessCheck: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMetrics: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=health.controller.d.ts.map