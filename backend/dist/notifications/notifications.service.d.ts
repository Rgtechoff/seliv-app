import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationType } from './entities/notification.entity';
import { Mission } from '../missions/entities/mission.entity';
export declare class NotificationsService {
    private readonly notificationRepo;
    private readonly missionRepo;
    private configService;
    private readonly resend;
    private readonly fromEmail;
    private readonly logger;
    constructor(notificationRepo: Repository<Notification>, missionRepo: Repository<Mission>, configService: ConfigService);
    create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        body: string;
        missionId?: string;
        sendEmail?: boolean;
        userEmail?: string;
    }): Promise<Notification>;
    findByUserId(userId: string): Promise<Notification[]>;
    markRead(notificationId: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    notifyMissionCreated(clientId: string, clientEmail: string, missionId: string): Promise<void>;
    notifyVendeurAssigned(clientId: string, clientEmail: string, missionId: string, vendeurName: string): Promise<void>;
    notifyMissionCompleted(clientId: string, clientEmail: string, missionId: string): Promise<void>;
    notifyFlaggedMessage(adminId: string, missionId: string): Promise<void>;
    notifyNewMissionAvailable(vendeurId: string, vendeurEmail: string, missionId: string, city: string): Promise<void>;
    sendMissionDayBeforeReminders(): Promise<void>;
    private sendEmail;
}
