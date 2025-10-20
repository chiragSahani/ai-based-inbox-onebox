"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRoutes = createHealthRoutes;
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
function createHealthRoutes(esService) {
    const router = (0, express_1.Router)();
    const healthController = new health_controller_1.HealthController(esService);
    router.get("/", healthController.healthCheck);
    router.get("/detailed", healthController.detailedHealthCheck);
    router.get("/ready", healthController.readinessCheck);
    router.get("/live", healthController.livenessCheck);
    router.get("/metrics", healthController.getMetrics);
    return router;
}
//# sourceMappingURL=health.routes.js.map