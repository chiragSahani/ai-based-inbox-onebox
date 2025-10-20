import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getAllNotifications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUnreadNotifications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    clearAll: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=notification.controller.d.ts.map