import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { PricingService } from './pricing.service';
import { Mission } from './entities/mission.entity';
import { MissionOption } from './entities/mission-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, MissionOption])],
  providers: [MissionsService, PricingService],
  controllers: [MissionsController],
  exports: [MissionsService, PricingService],
})
export class MissionsModule {}
