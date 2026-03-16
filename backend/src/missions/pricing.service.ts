import { Injectable } from '@nestjs/common';
import { VolumeEnum } from '../common/enums/volume.enum';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
import { PricingConfigService } from '../pricing-config/pricing-config.service';

const HOURLY_DISCOUNTS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.BASIC]: 0,
  [SubscriptionPlan.PRO]: 1000, // -10€/h
};

@Injectable()
export class PricingService {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  async calculateBasePrice(
    volume: VolumeEnum,
    durationHours: number,
    plan: SubscriptionPlan,
  ): Promise<number> {
    const hourlyRate = await this.pricingConfigService.getHourlyRate(volume);
    const hourlyDiscount = HOURLY_DISCOUNTS[plan];
    return (hourlyRate - hourlyDiscount) * durationHours;
  }

  async getHourlyRate(volume: VolumeEnum): Promise<number> {
    return this.pricingConfigService.getHourlyRate(volume);
  }

  getHourlyDiscount(plan: SubscriptionPlan): number {
    return HOURLY_DISCOUNTS[plan];
  }
}
