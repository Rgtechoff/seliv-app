import { Controller, Get } from '@nestjs/common';
import { PricingConfigService } from './pricing-config.service';

@Controller('pricing')
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  // Public endpoint — no auth required
  @Get('public')
  async getPublic() {
    const data = await this.pricingConfigService.getAll();
    return { data };
  }
}
