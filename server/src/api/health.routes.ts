import { Router } from "express";
import { HealthController } from "../controllers/health.controller";
import { ElasticsearchService } from "../services/elasticsearch.service";

export function createHealthRoutes(esService: ElasticsearchService): Router {
  const router = Router();
  const healthController = new HealthController(esService);

  router.get("/", healthController.healthCheck);

  router.get("/detailed", healthController.detailedHealthCheck);

  router.get("/ready", healthController.readinessCheck);

  router.get("/live", healthController.livenessCheck);

  router.get("/metrics", healthController.getMetrics);

  return router;
}
