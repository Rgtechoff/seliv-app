import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Review } from '../reviews/entities/review.entity';
import { Mission } from '../missions/entities/mission.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { VendeursPublicService } from './vendeurs-public.service';
import { VendeursPublicController } from './vendeurs-public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Review, Mission]),
    SubscriptionsModule,
  ],
  providers: [VendeursPublicService],
  controllers: [VendeursPublicController],
})
export class VendeursPublicModule {}
