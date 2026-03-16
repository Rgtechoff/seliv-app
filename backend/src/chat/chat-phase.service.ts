import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Mission } from '../missions/entities/mission.entity';

const MAX_PRE_ACCEPTANCE_MESSAGES = 10;

@Injectable()
export class ChatPhaseService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  getChatPhase(mission: Mission): 'pre_acceptance' | 'post_acceptance' {
    const postStatuses = ['assigned', 'in_progress', 'completed'];
    if (postStatuses.includes(mission.status as string)) {
      return 'post_acceptance';
    }
    return 'pre_acceptance';
  }

  async canSendMessage(
    mission: Mission,
    senderId: string,
  ): Promise<{ allowed: boolean; reason?: string; remaining: number | null }> {
    const phase = this.getChatPhase(mission);

    if (phase === 'post_acceptance') {
      return { allowed: true, remaining: null };
    }

    // pre_acceptance: limit 10 per sender
    const count = await this.chatRepo.count({
      where: {
        missionId: mission.id,
        senderId,
        chatPhase: 'pre_acceptance',
        moderationAction: Not('block'),
      },
    });

    const remaining = MAX_PRE_ACCEPTANCE_MESSAGES - count;
    if (remaining <= 0) {
      return {
        allowed: false,
        reason: 'Vous avez atteint la limite de 10 messages avant acceptation.',
        remaining: 0,
      };
    }

    return { allowed: true, remaining };
  }

  async getRemainingMessages(missionId: string, senderId: string): Promise<number | null> {
    // Return null if in post_acceptance (unlimited)
    // This is a quick check — caller should verify phase first
    const count = await this.chatRepo.count({
      where: {
        missionId,
        senderId,
        chatPhase: 'pre_acceptance',
        moderationAction: Not('block'),
      },
    });
    return Math.max(0, MAX_PRE_ACCEPTANCE_MESSAGES - count);
  }
}
