import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }

  // Handle Elasticsearch errors
  if (err.name === "ResponseError") {
    statusCode = 500;
    message = "Database operation failed";
  }

  // Handle IMAP errors
  if (err.message?.includes("IMAP")) {
    statusCode = 503;
    message = "Email service temporarily unavailable";
  }

  // Log error
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      statusCode,
    });
  } else {
    logger.warn({
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode,
    });
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    message,
    statusCode,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.error = err.message;
  }

  res.status(statusCode).json(errorResponse);
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Catch unhandled promise rejections
export const handleUnhandledRejection = () => {
  process.on("unhandledRejection", (reason: Error) => {
    logger.error({ err: reason }, "Unhandled Rejection");
    // Don't exit in production, log and continue
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  });
};

// Catch uncaught exceptions
export const handleUncaughtException = () => {
  process.on("uncaughtException", (error: Error) => {
    logger.error({ err: error }, "Uncaught Exception");
    // Exit process as app is in undefined state
    process.exit(1);
  });
};
