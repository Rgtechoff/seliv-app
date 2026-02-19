import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    MISSION_CREATED = "mission_created",
    VENDEUR_ASSIGNED = "vendeur_assigned",
    MISSION_REMINDER = "mission_reminder",
    MISSION_COMPLETED = "mission_completed",
    MISSION_CANCELLED = "mission_cancelled",
    NEW_CHAT_MESSAGE = "new_chat_message",
    CHAT_MESSAGE_FLAGGED = "chat_message_flagged",
    VENDEUR_VALIDATED = "vendeur_validated",
    NEW_MISSION_AVAILABLE = "new_mission_available"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    body: string;
    missionId: string | null;
    isRead: boolean;
    isEmailSent: boolean;
    createdAt: Date;
}
