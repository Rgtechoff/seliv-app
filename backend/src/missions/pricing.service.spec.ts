import { PricingService } from './pricing.service';
import { VolumeEnum } from '../common/enums/volume.enum';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(() => {
    service = new PricingService();
  });

  describe('calculateBasePrice', () => {
    it('should return 8000 * duration for 30 articles Basic', () => {
      expect(service.calculateBasePrice(VolumeEnum.V30, 1, SubscriptionPlan.BASIC)).toBe(8000);
    });

    it('should return 9000 * 2 for 50 articles Basic, 2h', () => {
      expect(service.calculateBasePrice(VolumeEnum.V50, 2, SubscriptionPlan.BASIC)).toBe(18000);
    });

    it('should return 11000 * 3 for 100 articles Basic, 3h', () => {
      expect(service.calculateBasePrice(VolumeEnum.V100, 3, SubscriptionPlan.BASIC)).toBe(33000);
    });

    it('should apply PRO discount of 1000 centimes/h', () => {
      // 100 articles, 3h, Pro: (11000 - 1000) * 3 = 30000
      expect(service.calculateBasePrice(VolumeEnum.V100, 3, SubscriptionPlan.PRO)).toBe(30000);
    });

    it('should return 14000 * duration for 200+ articles', () => {
      expect(service.calculateBasePrice(VolumeEnum.V200, 2, SubscriptionPlan.BASIC)).toBe(28000);
    });
  });

  describe('calculateTotalPrice - CDC example', () => {
    it('should match CDC example: Pro, 3h, 100 articles, Pack100 (12900c), Etiquetage 100 articles (5000c)', () => {
      // (110 - 10) * 3 = 300€ base = 30000c
      // Pack100 = 129€ = 12900c
      // Etiquetage 100 * 0.5€ = 50€ = 5000c
      // Total = 30000 + 12900 + 5000 = 47900c
      const total = service.calculateTotalPrice(
        VolumeEnum.V100,
        3,
        SubscriptionPlan.PRO,
        [12900, 5000],
      );
      expect(total).toBe(47900);
    });
  });

  describe('getHourlyDiscount', () => {
    it('should return 0 for BASIC', () => {
      expect(service.getHourlyDiscount(SubscriptionPlan.BASIC)).toBe(0);
    });

    it('should return 1000 for PRO', () => {
      expect(service.getHourlyDiscount(SubscriptionPlan.PRO)).toBe(1000);
    });
  });
});
