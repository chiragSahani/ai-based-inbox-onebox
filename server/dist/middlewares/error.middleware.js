"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUncaughtException = exports.handleUnhandledRejection = exports.asyncHandler = exports.errorHandler = exports.notFound = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
// Custom error class
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Not found middleware
const notFound = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
// Global error handler middleware
const errorHandler = (err, req, res, next) => {
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
        logger_1.logger.error({
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            statusCode,
        });
    }
    else {
        logger_1.logger.warn({
            message: err.message,
            url: req.originalUrl,
            method: req.method,
            statusCode,
        });
    }
    // Send error response
    const errorResponse = {
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
exports.errorHandler = errorHandler;
// Async handler wrapper to catch errors in async route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Catch unhandled promise rejections
const handleUnhandledRejection = () => {
    process.on("unhandledRejection", (reason) => {
        logger_1.logger.error({ err: reason }, "Unhandled Rejection");
        // Don't exit in production, log and continue
        if (process.env.NODE_ENV !== "production") {
            process.exit(1);
        }
    });
};
exports.handleUnhandledRejection = handleUnhandledRejection;
// Catch uncaught exceptions
const handleUncaughtException = () => {
    process.on("uncaughtException", (error) => {
        logger_1.logger.error({ err: error }, "Uncaught Exception");
        // Exit process as app is in undefined state
        process.exit(1);
    });
};
exports.handleUncaughtException = handleUncaughtException;
//# sourceMappingURL=error.middleware.js.map