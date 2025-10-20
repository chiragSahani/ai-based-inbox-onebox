import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { asyncHandler, AppError } from '../middlewares/error.middleware';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const notifications = this.notificationService.getAllNotifications();
    res.json({
      success: true,
      data: { notifications },
    });
  });

  getUnreadNotifications = asyncHandler(async (req: Request, res: Response) => {
    const notifications = this.notificationService.getUnreadNotifications();
    res.json({
      success: true,
      data: { notifications, count: notifications.length },
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Notification ID is required', 400);
    }

    const success = this.notificationService.markAsRead(id);

    if (!success) {
      throw new AppError('Notification not found', 404);
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  });

  clearAll = asyncHandler(async (req: Request, res: Response) => {
    this.notificationService.clearAll();
    res.json({
      success: true,
      message: 'All notifications cleared',
    });
  });
}
