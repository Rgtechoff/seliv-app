import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationService } from './moderation.service';
import { ModerationLog } from './entities/moderation-log.entity';
import { NormalizerService } from './normalizer.service';
import { PhoneDetector } from './detectors/phone.detector';
import { EmailDetector } from './detectors/email.detector';
import { SocialDetector } from './detectors/social.detector';
import { SplitDetector } from './detectors/split.detector';
import { ChatMessage } from '../entities/chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModerationLog, ChatMessage])],
  providers: [
    ModerationService,
    NormalizerService,
    PhoneDetector,
    EmailDetector,
    SocialDetector,
    SplitDetector,
  ],
  exports: [ModerationService],
})
export class ModerationModule {}
