import { VolumeEnum } from '../common/enums/volume.enum';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
export declare class PricingService {
    calculateBasePrice(volume: VolumeEnum, durationHours: number, plan: SubscriptionPlan): number;
    calculateTotalPrice(volume: VolumeEnum, durationHours: number, plan: SubscriptionPlan, optionsPricesCentimes: number[]): number;
    getHourlyRate(volume: VolumeEnum): number;
    getHourlyDiscount(plan: SubscriptionPlan): number;
}
