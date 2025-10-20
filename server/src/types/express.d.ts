import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    validatedData?: any;
    requestId?: string;
    _startTime?: [number, number];
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime?: Date;
    };
  }
}
