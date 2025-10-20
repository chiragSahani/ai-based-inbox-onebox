import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = this.notificationService.getAllNotifications();
      res.json({
        success: true,
        data: { notifications },
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to get notifications');
      next(error);
    }
  }

  async getUnreadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = this.notificationService.getUnreadNotifications();
      res.json({
        success: true,
        data: { notifications, count: notifications.length },
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to get unread notifications');
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required',
        });
        return;
      }
      const success = this.notificationService.markAsRead(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to mark notification as read');
      next(error);
    }
  }

  async clearAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.notificationService.clearAll();
      res.json({
        success: true,
        message: 'All notifications cleared',
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to clear notifications');
      next(error);
    }
  }
}
