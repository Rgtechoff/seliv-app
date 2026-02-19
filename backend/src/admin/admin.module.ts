import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MissionsModule } from '../missions/missions.module';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [MissionsModule, UsersModule, ChatModule, SubscriptionsModule],
  controllers: [AdminController],
})
export class AdminModule {}
