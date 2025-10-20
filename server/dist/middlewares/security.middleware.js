"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyValidation = exports.securityHeaders = exports.sanitizeRequest = exports.compressionMiddleware = exports.corsMiddleware = exports.helmetMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
// Helmet security headers
exports.helmetMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});
// CORS configuration
exports.corsMiddleware = (0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page"],
    maxAge: 600, // 10 minutes
});
// Compression middleware
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
});
// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach((key) => {
            if (typeof req.query[key] === "string") {
                req.query[key] = req.query[key].trim();
            }
        });
    }
    // Sanitize body
    if (req.body && typeof req.body === "object") {
        Object.keys(req.body).forEach((key) => {
            if (typeof req.body[key] === "string") {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};
exports.sanitizeRequest = sanitizeRequest;
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Remove sensitive headers
    res.removeHeader("X-Powered-By");
    // Add custom security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
};
exports.securityHeaders = securityHeaders;
// API key validation middleware (for production)
const apiKeyValidation = (req, res, next) => {
    // Skip in development
    if (process.env.NODE_ENV === "development") {
        return next();
    }
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key is required",
        });
    }
    // Validate API key (implement your own logic)
    const validApiKey = process.env.API_KEY;
    if (apiKey !== validApiKey) {
        return res.status(403).json({
            success: false,
            message: "Invalid API key",
        });
    }
    next();
};
exports.apiKeyValidation = apiKeyValidation;
//# sourceMappingURL=security.middleware.js.map