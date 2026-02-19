import { SubscriptionsService } from './subscriptions.service';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
import { ConfigService } from '@nestjs/config';
declare class CreateSubscriptionDto {
    plan: SubscriptionPlan;
}
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly configService;
    constructor(subscriptionsService: SubscriptionsService, configService: ConfigService);
    getMy(user: User): Promise<{
        data: import("./entities/subscription.entity").Subscription | null;
    }>;
    createCheckout(user: User, dto: CreateSubscriptionDto): Promise<{
        data: {
            url: string;
        };
    }>;
}
export {};
