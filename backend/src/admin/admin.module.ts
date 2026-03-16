import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MissionsModule } from '../missions/missions.module';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PricingConfigModule } from '../pricing-config/pricing-config.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [MissionsModule, UsersModule, ChatModule, SubscriptionsModule, PricingConfigModule, PromoCodesModule],
  controllers: [AdminController],
})
export class AdminModule {}
