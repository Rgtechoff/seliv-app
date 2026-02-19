import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getAll(user: User): Promise<{
        data: import("./entities/notification.entity").Notification[];
    }>;
    markRead(id: string, user: User): Promise<{
        data: {
            success: boolean;
        };
    }>;
    markAllRead(user: User): Promise<{
        data: {
            success: boolean;
        };
    }>;
}
