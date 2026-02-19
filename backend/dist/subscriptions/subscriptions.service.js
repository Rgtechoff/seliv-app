"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const subscription_entity_1 = require("./entities/subscription.entity");
const subscription_plan_enum_1 = require("../common/enums/subscription-plan.enum");
const users_service_1 = require("../users/users.service");
const PLAN_PRICES = {
    [subscription_plan_enum_1.SubscriptionPlan.BASIC]: 2900,
    [subscription_plan_enum_1.SubscriptionPlan.PRO]: 7900,
};
const PLAN_DISCOUNTS = {
    [subscription_plan_enum_1.SubscriptionPlan.BASIC]: 0,
    [subscription_plan_enum_1.SubscriptionPlan.PRO]: 1000,
};
let SubscriptionsService = class SubscriptionsService {
    constructor(subRepo, usersService, configService) {
        this.subRepo = subRepo;
        this.usersService = usersService;
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.getOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2026-01-28.clover' });
    }
    async findActiveByUserId(userId) {
        return this.subRepo.findOne({
            where: { userId, status: subscription_entity_1.SubscriptionStatus.ACTIVE },
        });
    }
    async getUserPlan(userId) {
        const sub = await this.findActiveByUserId(userId);
        return sub?.plan ?? subscription_plan_enum_1.SubscriptionPlan.BASIC;
    }
    async createCheckoutSession(userId, plan, frontendUrl) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                metadata: { userId },
            });
            customerId = customer.id;
            await this.usersService.updateStripeCustomerId(userId, customerId);
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        recurring: { interval: 'month' },
                        product_data: { name: `SELIV ${plan.toUpperCase()}` },
                        unit_amount: PLAN_PRICES[plan],
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${frontendUrl}/client/subscription?success=true`,
            cancel_url: `${frontendUrl}/client/subscription`,
            metadata: { userId, plan },
        });
        return { url: session.url };
    }
    async handleWebhook(event) {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                await this.upsertSubscription(sub);
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                await this.subRepo.update({ stripeSubscriptionId: sub.id }, { status: subscription_entity_1.SubscriptionStatus.CANCELLED });
                break;
            }
        }
    }
    async upsertSubscription(stripeSub) {
        const userId = stripeSub.metadata?.['userId'];
        const plan = stripeSub.metadata?.['plan'] ??
            subscription_plan_enum_1.SubscriptionPlan.BASIC;
        if (!userId)
            return;
        const existing = await this.subRepo.findOne({
            where: { stripeSubscriptionId: stripeSub.id },
        });
        const data = {
            userId,
            plan,
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer,
            status: stripeSub.status,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            hourlyDiscount: PLAN_DISCOUNTS[plan],
        };
        if (existing) {
            await this.subRepo.update(existing.id, data);
        }
        else {
            await this.subRepo.save(this.subRepo.create(data));
        }
    }
    async findAll() {
        return this.subRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        config_1.ConfigService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map