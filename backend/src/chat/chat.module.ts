import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatPhaseService } from './chat-phase.service';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatPreset } from './entities/chat-preset.entity';
import { MissionInterest } from './entities/mission-interest.entity';
import { Mission } from '../missions/entities/mission.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ModerationModule } from './moderation/moderation.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, ChatPreset, Mission, MissionInterest]),
    NotificationsModule,
    ModerationModule,
    forwardRef(() => MissionsModule),
  ],
  providers: [ChatService, ChatGateway, ChatPhaseService],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway, ModerationModule],
})
export class ChatModule {}
