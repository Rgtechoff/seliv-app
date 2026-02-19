import { Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { MissionOption } from './entities/mission-option.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { MissionStatus } from '../common/enums/mission-status.enum';
import { PricingService } from './pricing.service';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
export declare class MissionsService {
    private readonly missionRepo;
    private readonly optionRepo;
    private readonly pricingService;
    constructor(missionRepo: Repository<Mission>, optionRepo: Repository<MissionOption>, pricingService: PricingService);
    validateTransition(from: MissionStatus, to: MissionStatus): void;
    create(clientId: string, dto: CreateMissionDto, plan: SubscriptionPlan): Promise<Mission>;
    findById(id: string): Promise<Mission | null>;
    findByClientId(clientId: string): Promise<Mission[]>;
    findByVendeurId(vendeurId: string): Promise<Mission[]>;
    findAvailableForVendeur(zones: string[], categories: string[]): Promise<Mission[]>;
    assignVendeur(missionId: string, vendeurId: string): Promise<Mission>;
    markInProgress(missionId: string): Promise<Mission>;
    markCompleted(missionId: string, vendeurId: string): Promise<Mission>;
    cancel(missionId: string, requesterId: string, reason: string): Promise<{
        mission: Mission;
        refundPercent: number;
    }>;
    updateStripeData(missionId: string, data: {
        stripePaymentId?: string;
        stripeCheckoutSessionId?: string;
        paidAt?: Date;
        status?: MissionStatus;
    }): Promise<void>;
    findAll(): Promise<Mission[]>;
}
