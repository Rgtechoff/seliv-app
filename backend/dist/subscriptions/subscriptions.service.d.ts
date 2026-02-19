import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
import { UsersService } from '../users/users.service';
export declare class SubscriptionsService {
    private readonly subRepo;
    private readonly usersService;
    private configService;
    private readonly stripe;
    constructor(subRepo: Repository<Subscription>, usersService: UsersService, configService: ConfigService);
    findActiveByUserId(userId: string): Promise<Subscription | null>;
    getUserPlan(userId: string): Promise<SubscriptionPlan>;
    createCheckoutSession(userId: string, plan: SubscriptionPlan, frontendUrl: string): Promise<{
        url: string;
    }>;
    handleWebhook(event: Stripe.Event): Promise<void>;
    private upsertSubscription;
    findAll(): Promise<Subscription[]>;
}
