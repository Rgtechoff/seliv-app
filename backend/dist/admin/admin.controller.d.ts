import { Response } from 'express';
import { UserRole } from '../common/enums/user-role.enum';
import { MissionsService } from '../missions/missions.service';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MissionStatus } from '../common/enums/mission-status.enum';
declare class AdminAssignVendeurDto {
    vendeurId: string;
}
declare class AdminChangeStatusDto {
    status: MissionStatus;
    reason?: string;
}
export declare class AdminController {
    private readonly missionsService;
    private readonly usersService;
    private readonly chatService;
    private readonly subscriptionsService;
    constructor(missionsService: MissionsService, usersService: UsersService, chatService: ChatService, subscriptionsService: SubscriptionsService);
    getAllMissions(): Promise<{
        data: import("../missions/entities/mission.entity").Mission[];
    }>;
    getAllSubscriptions(): Promise<{
        data: import("../subscriptions/entities/subscription.entity").Subscription[];
    }>;
    assignVendeur(missionId: string, dto: AdminAssignVendeurDto): Promise<{
        data: import("../missions/entities/mission.entity").Mission;
    }>;
    changeMissionStatus(missionId: string, dto: AdminChangeStatusDto): Promise<{
        data: null;
    } | {
        data: import("../missions/entities/mission.entity").Mission;
    }>;
    getAllVendeurs(): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    validateVendeur(id: string): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    toggleStar(id: string): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getAllClients(): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getFlaggedMessages(): Promise<{
        data: import("../chat/entities/chat-message.entity").ChatMessage[];
    }>;
    approveMessage(id: string): Promise<{
        data: import("../chat/entities/chat-message.entity").ChatMessage;
    }>;
    deleteMessage(id: string): Promise<{
        data: {
            success: boolean;
        };
    }>;
    exportMissions(res: Response): Promise<void>;
}
export {};
