import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from '../../common/enums/subscription-plan.enum';
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    PAST_DUE = "past_due",
    TRIALING = "trialing",
    INACTIVE = "inactive"
}
export declare class Subscription {
    id: string;
    userId: string;
    user: User;
    plan: SubscriptionPlan;
    stripeSubscriptionId: string | null;
    stripeCustomerId: string | null;
    status: SubscriptionStatus;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    hourlyDiscount: number;
    createdAt: Date;
    updatedAt: Date;
}
