"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const volume_enum_1 = require("../common/enums/volume.enum");
const subscription_plan_enum_1 = require("../common/enums/subscription-plan.enum");
const HOURLY_RATES = {
    [volume_enum_1.VolumeEnum.V30]: 8000,
    [volume_enum_1.VolumeEnum.V50]: 9000,
    [volume_enum_1.VolumeEnum.V100]: 11000,
    [volume_enum_1.VolumeEnum.V200]: 14000,
};
const HOURLY_DISCOUNTS = {
    [subscription_plan_enum_1.SubscriptionPlan.BASIC]: 0,
    [subscription_plan_enum_1.SubscriptionPlan.PRO]: 1000,
};
let PricingService = class PricingService {
    calculateBasePrice(volume, durationHours, plan) {
        const hourlyRate = HOURLY_RATES[volume];
        const hourlyDiscount = HOURLY_DISCOUNTS[plan];
        return (hourlyRate - hourlyDiscount) * durationHours;
    }
    calculateTotalPrice(volume, durationHours, plan, optionsPricesCentimes) {
        const basePrice = this.calculateBasePrice(volume, durationHours, plan);
        const optionsTotal = optionsPricesCentimes.reduce((sum, p) => sum + p, 0);
        return basePrice + optionsTotal;
    }
    getHourlyRate(volume) {
        return HOURLY_RATES[volume];
    }
    getHourlyDiscount(plan) {
        return HOURLY_DISCOUNTS[plan];
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)()
], PricingService);
//# sourceMappingURL=pricing.service.js.map