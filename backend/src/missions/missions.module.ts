import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { PricingService } from './pricing.service';
import { Mission } from './entities/mission.entity';
import { MissionOption } from './entities/mission-option.entity';
import { ChatModule } from '../chat/chat.module';
import { PricingConfigModule } from '../pricing-config/pricing-config.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, MissionOption]),
    forwardRef(() => ChatModule),
    PricingConfigModule,
    PromoCodesModule,
  ],
  providers: [MissionsService, PricingService],
  controllers: [MissionsController],
  exports: [MissionsService, PricingService],
})
export class MissionsModule {}
