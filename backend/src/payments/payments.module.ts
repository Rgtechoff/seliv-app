import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MissionsModule } from '../missions/missions.module';
import { Mission } from '../missions/entities/mission.entity';

@Module({
  imports: [MissionsModule, TypeOrmModule.forFeature([Mission])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
