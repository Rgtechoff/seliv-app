import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { MissionsService } from '../missions/missions.service';
import { Mission } from '../missions/entities/mission.entity';
export declare class PaymentsService {
    private configService;
    private missionsService;
    private missionRepo;
    private readonly stripe;
    constructor(configService: ConfigService, missionsService: MissionsService, missionRepo: Repository<Mission>);
    createCheckoutSession(missionId: string, totalPriceCentimes: number, clientEmail: string, frontendUrl: string): Promise<{
        url: string;
    }>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;
    refund(paymentIntentId: string, amountCentimes: number): Promise<Stripe.Refund>;
    generateInvoicePdf(missionId: string): Promise<Buffer>;
}
