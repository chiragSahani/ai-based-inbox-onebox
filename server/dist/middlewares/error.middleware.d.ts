import { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const handleUnhandledRejection: () => void;
export declare const handleUncaughtException: () => void;
//# sourceMappingURL=error.middleware.d.ts.map