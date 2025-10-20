import morgan from "morgan";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

// Custom token for Morgan to get response time
morgan.token("response-time", (req: Request, res: Response) => {
  if (!req._startTime) return "0";
  const diff = process.hrtime(req._startTime);
  const time = diff[0] * 1000 + diff[1] / 1000000;
  return time.toFixed(3);
});

// Custom token for request body (in development only)
morgan.token("body", (req: Request) => {
  if (process.env.NODE_ENV === "development") {
    return JSON.stringify(req.body);
  }
  return "";
});

// Morgan stream to Pino logger
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Development format
const devFormat =
  ":method :url :status :response-time ms - :res[content-length]";

// Production format
const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// HTTP request logger middleware
export const httpLogger = morgan(
  process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  { stream }
);

// Request ID middleware
export const requestId = (req: Request, res: Response, next: Function) => {
  const requestIdValue = req.headers["x-request-id"];
  const finalRequestId =
    typeof requestIdValue === "string"
      ? requestIdValue
      : Array.isArray(requestIdValue) && requestIdValue[0]
      ? requestIdValue[0]
      : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = finalRequestId;
  res.setHeader("X-Request-ID", finalRequestId);
  next();
};

// Performance monitoring middleware
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: Function
) => {
  req._startTime = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(req._startTime);
    const time = diff[0] * 1000 + diff[1] / 1000000;

    // Log slow requests (> 1 second)
    if (time > 1000) {
      logger.warn({
        message: "Slow request detected",
        method: req.method,
        url: req.originalUrl,
        responseTime: `${time.toFixed(3)}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};
