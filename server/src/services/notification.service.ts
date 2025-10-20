import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface Notification {
  id: string;
  type: 'new_email' | 'reply' | 'mention' | 'system';
  title: string;
  message: string;
  emailId?: string;
  timestamp: Date;
  read: boolean;
}

export class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    super();
  }

  createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    emailId?: string
  ): Notification {
    const notification: Notification = {
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

    logger.info(`Notification created: ${notification.id} - ${title}`);

    return notification;
  }

  notifyNewEmail(from: string, subject: string, emailId: string): void {
    this.createNotification(
      'new_email',
      'New Email',
      `From: ${from} - ${subject}`,
      emailId
    );
  }

  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getUnreadNotifications(): Notification[] {
    return this.getAllNotifications().filter((n) => !n.read);
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  clearAll(): void {
    this.notifications.clear();
    logger.info('All notifications cleared');
  }

  getNotificationById(id: string): Notification | undefined {
    return this.notifications.get(id);
  }
}
