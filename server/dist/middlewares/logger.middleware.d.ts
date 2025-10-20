import { Request, Response } from "express";
export declare const httpLogger: (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error) => void) => void;
export declare const requestId: (req: Request, res: Response, next: Function) => void;
export declare const performanceMonitor: (req: Request, res: Response, next: Function) => void;
//# sourceMappingURL=logger.middleware.d.ts.map