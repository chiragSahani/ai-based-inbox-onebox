import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';

export function createNotificationRoutes(notificationService: NotificationService): Router {
  const router = Router();
  const controller = new NotificationController(notificationService);

  router.get('/', controller.getAllNotifications.bind(controller));
  router.get('/unread', controller.getUnreadNotifications.bind(controller));
  router.put('/:id/read', controller.markAsRead.bind(controller));
  router.delete('/', controller.clearAll.bind(controller));

  return router;
}
