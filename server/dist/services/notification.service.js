"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class NotificationService extends events_1.EventEmitter {
    constructor() {
        super();
        this.notifications = new Map();
    }
    createNotification(type, title, message, emailId) {
        const notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            message,
            ...(emailId && { emailId }),
            timestamp: new Date(),
            read: false,
        };
        this.notifications.set(notification.id, notification);
        this.emit('notification', notification);
        logger_1.logger.info(`Notification created: ${notification.id} - ${title}`);
        return notification;
    }
    notifyNewEmail(from, subject, emailId) {
        this.createNotification('new_email', 'New Email', `From: ${from} - ${subject}`, emailId);
    }
    getAllNotifications() {
        return Array.from(this.notifications.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getUnreadNotifications() {
        return this.getAllNotifications().filter((n) => !n.read);
    }
    markAsRead(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.read = true;
            return true;
        }
        return false;
    }
    clearAll() {
        this.notifications.clear();
        logger_1.logger.info('All notifications cleared');
    }
    getNotificationById(id) {
        return this.notifications.get(id);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map