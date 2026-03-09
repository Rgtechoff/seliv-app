import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Review } from '../reviews/entities/review.entity';
import { ActivityLog } from '../activity-log/entities/activity-log.entity';
import { SuperAdminVendeursService } from './vendeurs/super-admin-vendeurs.service';
import { SuperAdminVendeursController } from './vendeurs/super-admin-vendeurs.controller';
import { SuperAdminClientsService } from './clients/super-admin-clients.service';
import { SuperAdminClientsController } from './clients/super-admin-clients.controller';
import { SuperAdminAnalyticsService } from './analytics/super-admin-analytics.service';
import { SuperAdminAnalyticsController } from './analytics/super-admin-analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Mission, Subscription, Review, ActivityLog])],
  controllers: [
    SuperAdminVendeursController,
    SuperAdminClientsController,
    SuperAdminAnalyticsController,
  ],
  providers: [
    SuperAdminVendeursService,
    SuperAdminClientsService,
    SuperAdminAnalyticsService,
  ],
})
export class SuperAdminModule {}
