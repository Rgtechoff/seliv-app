import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ChatMessage } from '../../entities/chat-message.entity';
import { NormalizerService } from '../normalizer.service';
import { PhoneDetector } from './phone.detector';
import { EmailDetector } from './email.detector';
import { DetectionResult } from './phone.detector';

@Injectable()
export class SplitDetector {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
    private readonly normalizer: NormalizerService,
    private readonly phoneDetector: PhoneDetector,
    private readonly emailDetector: EmailDetector,
  ) {}

  async detectSplit(
    currentMessage: string,
    senderId: string,
    missionId: string,
  ): Promise<DetectionResult> {
    const recentMessages = await this.chatRepo.find({
      where: {
        missionId,
        senderId,
        createdAt: MoreThan(new Date(Date.now() - 3 * 60 * 1000)),
        isFlagged: false,
      },
      order: { createdAt: 'ASC' },
      take: 5,
    });

    if (recentMessages.length === 0) return { found: false, type: null, score: 0 };

    const combined = [...recentMessages.map((m) => m.content), currentMessage].join(' ');
    const { normalized, normalizedNumbers } = this.normalizer.normalize(combined);

    const phoneResult = this.phoneDetector.detect(normalized, normalizedNumbers);
    if (phoneResult.found) return { found: true, type: 'split_phone', score: phoneResult.score + 10 };

    const emailResult = this.emailDetector.detect(combined, normalized);
    if (emailResult.found) return { found: true, type: 'split_email', score: emailResult.score + 10 };

    return { found: false, type: null, score: 0 };
  }
}
