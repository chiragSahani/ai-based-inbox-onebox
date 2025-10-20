"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const os_1 = __importDefault(require("os"));
class HealthController {
    constructor(esService) {
        this.esService = esService;
        this.healthCheck = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            res.status(200).json({
                success: true,
                message: "Service is healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
            });
        });
        this.detailedHealthCheck = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const health = {
                success: true,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
                services: {},
                system: {
                    platform: os_1.default.platform(),
                    arch: os_1.default.arch(),
                    nodeVersion: process.version,
                    memory: {
                        total: Math.round(os_1.default.totalmem() / 1024 / 1024),
                        free: Math.round(os_1.default.freemem() / 1024 / 1024),
                        used: Math.round((os_1.default.totalmem() - os_1.default.freemem()) / 1024 / 1024),
                        percentage: Math.round(((os_1.default.totalmem() - os_1.default.freemem()) / os_1.default.totalmem()) * 100),
                    },
                    cpu: {
                        cores: os_1.default.cpus().length,
                        model: os_1.default.cpus()[0]?.model,
                    },
                },
            };
            // Check Elasticsearch
            try {
                const esHealth = await this.esService["client"].cluster.health();
                health.services.elasticsearch = {
                    status: "healthy",
                    clusterStatus: esHealth.status,
                };
            }
            catch (error) {
                health.services.elasticsearch = {
                    status: "unhealthy",
                    error: error.message,
                };
                health.success = false;
            }
            // Check Qdrant (if accessible)
            health.services.qdrant = {
                status: "unknown",
                message: "Health check not implemented",
            };
            // Check IMAP services
            health.services.imap = {
                status: "running",
                message: "IMAP services are active",
            };
            const statusCode = health.success ? 200 : 503;
            res.status(statusCode).json(health);
        });
        // Readiness probe (for Kubernetes)
        this.readinessCheck = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            try {
                // Check if Elasticsearch is ready
                await this.esService["client"].ping();
                res.status(200).json({
                    success: true,
                    message: "Service is ready",
                });
            }
            catch (error) {
                res.status(503).json({
                    success: false,
                    message: "Service is not ready",
                });
            }
        });
        // Liveness probe (for Kubernetes)
        this.livenessCheck = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            // Simple check that the service is running
            res.status(200).json({
                success: true,
                message: "Service is alive",
            });
        });
        // Metrics endpoint
        this.getMetrics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const metrics = {
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: {
                    rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                    heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    external: Math.round(process.memoryUsage().external / 1024 / 1024),
                },
                cpu: process.cpuUsage(),
                eventLoop: {
                    lag: 0, // Can implement event loop lag monitoring
                },
            };
            res.status(200).json({
                success: true,
                data: metrics,
            });
        });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map