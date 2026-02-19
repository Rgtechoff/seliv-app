import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
import { UsersService } from '../users/users.service';

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.BASIC]: 2900, // 29€/mois
  [SubscriptionPlan.PRO]: 7900,   // 79€/mois
};

const PLAN_DISCOUNTS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.BASIC]: 0,
  [SubscriptionPlan.PRO]: 1000, // -10€/h
};

@Injectable()
export class SubscriptionsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    private readonly usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-01-28.clover' },
    );
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    return this.subRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
  }

  async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    const sub = await this.findActiveByUserId(userId);
    return sub?.plan ?? SubscriptionPlan.BASIC;
  }

  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    frontendUrl: string,
  ): Promise<{ url: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

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

    return { url: session.url! };
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.upsertSubscription(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.subRepo.update(
          { stripeSubscriptionId: sub.id },
          { status: SubscriptionStatus.CANCELLED },
        );
        break;
      }
    }
  }

  private async upsertSubscription(
    stripeSub: Stripe.Subscription,
  ): Promise<void> {
    const userId = stripeSub.metadata?.['userId'];
    const plan =
      (stripeSub.metadata?.['plan'] as SubscriptionPlan) ??
      SubscriptionPlan.BASIC;
    if (!userId) return;

    const existing = await this.subRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    const data = {
      userId,
      plan,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: stripeSub.customer as string,
      status: stripeSub.status as SubscriptionStatus,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
      hourlyDiscount: PLAN_DISCOUNTS[plan],
    };

    if (existing) {
      await this.subRepo.update(existing.id, data);
    } else {
      await this.subRepo.save(this.subRepo.create(data));
    }
  }

  async findAll(): Promise<Subscription[]> {
    return this.subRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
