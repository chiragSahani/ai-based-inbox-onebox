import { EventEmitter } from 'events';
export interface Notification {
    id: string;
    type: 'new_email' | 'reply' | 'mention' | 'system';
    title: string;
    message: string;
    emailId?: string;
    timestamp: Date;
    read: boolean;
}
export declare class NotificationService extends EventEmitter {
    private notifications;
    constructor();
    createNotification(type: Notification['type'], title: string, message: string, emailId?: string): Notification;
    notifyNewEmail(from: string, subject: string, emailId: string): void;
    getAllNotifications(): Notification[];
    getUnreadNotifications(): Notification[];
    markAsRead(notificationId: string): boolean;
    clearAll(): void;
    getNotificationById(id: string): Notification | undefined;
}
//# sourceMappingURL=notification.service.d.ts.map