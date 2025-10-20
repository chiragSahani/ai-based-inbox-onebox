"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = exports.requestId = exports.httpLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../utils/logger");
// Custom token for Morgan to get response time
morgan_1.default.token("response-time", (req, res) => {
    if (!req._startTime)
        return "0";
    const diff = process.hrtime(req._startTime);
    const time = diff[0] * 1000 + diff[1] / 1000000;
    return time.toFixed(3);
});
// Custom token for request body (in development only)
morgan_1.default.token("body", (req) => {
    if (process.env.NODE_ENV === "development") {
        return JSON.stringify(req.body);
    }
    return "";
});
// Morgan stream to Pino logger
const stream = {
    write: (message) => {
        logger_1.logger.info(message.trim());
    },
};
// Development format
const devFormat = ":method :url :status :response-time ms - :res[content-length]";
// Production format
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';
// HTTP request logger middleware
exports.httpLogger = (0, morgan_1.default)(process.env.NODE_ENV === "production" ? prodFormat : devFormat, { stream });
// Request ID middleware
const requestId = (req, res, next) => {
    const requestIdValue = req.headers["x-request-id"];
    const finalRequestId = typeof requestIdValue === "string"
        ? requestIdValue
        : Array.isArray(requestIdValue) && requestIdValue[0]
            ? requestIdValue[0]
            : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = finalRequestId;
    res.setHeader("X-Request-ID", finalRequestId);
    next();
};
exports.requestId = requestId;
// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
    req._startTime = process.hrtime();
    res.on("finish", () => {
        const diff = process.hrtime(req._startTime);
        const time = diff[0] * 1000 + diff[1] / 1000000;
        // Log slow requests (> 1 second)
        if (time > 1000) {
            logger_1.logger.warn({
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
exports.performanceMonitor = performanceMonitor;
//# sourceMappingURL=logger.middleware.js.map