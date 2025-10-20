"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountLimiter = exports.authLimiter = exports.searchLimiter = exports.aiOperationsLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later",
            retryAfter: req.rateLimit?.resetTime
                ? Math.ceil(req.rateLimit.resetTime.getTime() / 1000)
                : undefined,
        });
    },
});
// Strict rate limiter for AI operations (expensive)
exports.aiOperationsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 AI requests per hour
    message: {
        success: false,
        message: "AI operation limit exceeded, please try again after 1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "AI operation limit exceeded. Please try again later.",
            retryAfter: req.rateLimit?.resetTime
                ? Math.ceil(req.rateLimit.resetTime.getTime() / 1000)
                : undefined,
        });
    },
});
// Search rate limiter
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Limit each IP to 50 search requests per 5 minutes
    message: {
        success: false,
        message: "Too many search requests, please try again after 5 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Auth rate limiter (if implementing authentication)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: {
        success: false,
        message: "Too many login attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});
// Create account limiter
exports.createAccountLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 account creations per hour
    message: {
        success: false,
        message: "Too many accounts created from this IP, please try again after 1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=ratelimit.middleware.js.map