"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationRoutes = createNotificationRoutes;
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
function createNotificationRoutes(notificationService) {
    const router = (0, express_1.Router)();
    const controller = new notification_controller_1.NotificationController(notificationService);
    router.get("/", controller.getAllNotifications.bind(controller));
    router.get("/unread", controller.getUnreadNotifications.bind(controller));
    router.put("/:id/read", controller.markAsRead.bind(controller));
    router.delete("/", controller.clearAll.bind(controller));
    return router;
}
//# sourceMappingURL=notification.routes.js.map