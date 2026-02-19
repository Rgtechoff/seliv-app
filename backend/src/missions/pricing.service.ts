import { Injectable } from '@nestjs/common';
import { VolumeEnum } from '../common/enums/volume.enum';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';

// All prices in centimes
const HOURLY_RATES: Record<VolumeEnum, number> = {
  [VolumeEnum.V30]: 8000,   // 80€/h
  [VolumeEnum.V50]: 9000,   // 90€/h
  [VolumeEnum.V100]: 11000, // 110€/h
  [VolumeEnum.V200]: 14000, // 140€/h
};

const HOURLY_DISCOUNTS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.BASIC]: 0,
  [SubscriptionPlan.PRO]: 1000, // -10€/h = -1000 centimes/h
};

@Injectable()
export class PricingService {
  calculateBasePrice(
    volume: VolumeEnum,
    durationHours: number,
    plan: SubscriptionPlan,
  ): number {
    const hourlyRate = HOURLY_RATES[volume];
    const hourlyDiscount = HOURLY_DISCOUNTS[plan];
    return (hourlyRate - hourlyDiscount) * durationHours;
  }

  calculateTotalPrice(
    volume: VolumeEnum,
    durationHours: number,
    plan: SubscriptionPlan,
    optionsPricesCentimes: number[],
  ): number {
    const basePrice = this.calculateBasePrice(volume, durationHours, plan);
    const optionsTotal = optionsPricesCentimes.reduce((sum, p) => sum + p, 0);
    return basePrice + optionsTotal;
  }

  getHourlyRate(volume: VolumeEnum): number {
    return HOURLY_RATES[volume];
  }

  getHourlyDiscount(plan: SubscriptionPlan): number {
    return HOURLY_DISCOUNTS[plan];
  }
}
