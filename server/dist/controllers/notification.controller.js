"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.getAllNotifications = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const notifications = this.notificationService.getAllNotifications();
            res.json({
                success: true,
                data: { notifications },
            });
        });
        this.getUnreadNotifications = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const notifications = this.notificationService.getUnreadNotifications();
            res.json({
                success: true,
                data: { notifications, count: notifications.length },
            });
        });
        this.markAsRead = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            if (!id) {
                throw new error_middleware_1.AppError('Notification ID is required', 400);
            }
            const success = this.notificationService.markAsRead(id);
            if (!success) {
                throw new error_middleware_1.AppError('Notification not found', 404);
            }
            res.json({
                success: true,
                message: 'Notification marked as read',
            });
        });
        this.clearAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            this.notificationService.clearAll();
            res.json({
                success: true,
                message: 'All notifications cleared',
            });
        });
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map