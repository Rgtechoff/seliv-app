import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { MissionsService } from '../missions/missions.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
declare class CancelMissionDto {
    reason: string;
}
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly missionsService;
    private readonly configService;
    constructor(paymentsService: PaymentsService, missionsService: MissionsService, configService: ConfigService);
    createCheckout(missionId: string, user: User): Promise<{
        data: {
            url: string;
        };
    }>;
    cancelMission(missionId: string, user: User, dto: CancelMissionDto): Promise<{
        data: {
            mission: import("../missions/entities/mission.entity").Mission;
            refund: import("stripe").Stripe.Refund;
            refundPercent: number;
        };
    } | {
        data: {
            mission: import("../missions/entities/mission.entity").Mission;
            refundPercent: number;
            refund?: undefined;
        };
    }>;
    downloadInvoice(missionId: string, res: Response): Promise<void>;
    handleWebhook(req: Request & {
        rawBody?: Buffer;
    }, signature: string): Promise<{
        received: boolean;
    }>;
}
export {};
