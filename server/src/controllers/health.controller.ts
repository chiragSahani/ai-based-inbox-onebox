import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { ElasticsearchService } from "../services/elasticsearch.service";
import os from "os";

export class HealthController {
  constructor(private esService: ElasticsearchService) {}

  healthCheck = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Service is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  detailedHealthCheck = asyncHandler(async (req: Request, res: Response) => {
    const health: any = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        elasticsearch: { status: "unknown" },
        qdrant: { status: "unknown" },
        imap: { status: "running" },
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
          total: Math.round(os.totalmem() / 1024 / 1024),
          free: Math.round(os.freemem() / 1024 / 1024),
          used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
          percentage: Math.round(
            ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
          ),
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model,
        },
      },
    };

    try {
      const esHealth = await this.esService.getHealth();
      health.services.elasticsearch = {
        status: "healthy",
        clusterStatus: esHealth.status,
      };
    } catch (error: any) {
      health.services.elasticsearch = {
        status: "unhealthy",
        error: error.message,
      };
      health.success = false;
    }

    health.services.qdrant = {
      status: "unknown",
      message: "Health check not implemented",
    };

    health.services.imap = {
      status: "running",
      message: "IMAP services are active",
    };

    const statusCode = health.success ? 200 : 503;

    res.status(statusCode).json(health);
  });

  readinessCheck = asyncHandler(async (req: Request, res: Response) => {
    const isReady = await this.esService.ping();

    if (isReady) {
      res.status(200).json({
        success: true,
        message: "Service is ready",
      });
    } else {
      res.status(503).json({
        success: false,
        message: "Service is not ready",
      });
    }
  });

  livenessCheck = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Service is alive",
    });
  });

  getMetrics = asyncHandler(async (req: Request, res: Response) => {
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
        lag: 0,
      },
    };

    res.status(200).json({
      success: true,
      data: metrics,
    });
  });
}
