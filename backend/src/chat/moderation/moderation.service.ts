import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationLog } from './entities/moderation-log.entity';
import { NormalizerService } from './normalizer.service';
import { PhoneDetector } from './detectors/phone.detector';
import { EmailDetector } from './detectors/email.detector';
import { SocialDetector } from './detectors/social.detector';
import { SplitDetector } from './detectors/split.detector';

export interface ModerationResult {
  action: 'allow' | 'flag' | 'block';
  score: number;
  reasons: string[];
  phase: 'pre_acceptance' | 'post_acceptance';
}

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ModerationLog)
    private readonly logRepo: Repository<ModerationLog>,
    private readonly normalizer: NormalizerService,
    private readonly phoneDetector: PhoneDetector,
    private readonly emailDetector: EmailDetector,
    private readonly socialDetector: SocialDetector,
    private readonly splitDetector: SplitDetector,
  ) {}

  async analyze(
    content: string,
    senderId: string,
    missionId: string,
    phase: 'pre_acceptance' | 'post_acceptance',
  ): Promise<ModerationResult> {
    const { normalized, normalizedNumbers } = this.normalizer.normalize(content);

    const detections = [
      this.phoneDetector.detect(normalized, normalizedNumbers),
      this.emailDetector.detect(content, normalized),
      this.socialDetector.detect(content, normalized),
      await this.splitDetector.detectSplit(content, senderId, missionId),
    ];

    const totalScore = detections.reduce((sum, d) => sum + d.score, 0);
    const reasons = detections.filter((d) => d.found).map((d) => d.type!);

    // Seuils selon phase
    const thresholds =
      phase === 'pre_acceptance'
        ? { block: 35, flag: 15 }
        : { block: 50, flag: 25 };

    let action: 'allow' | 'flag' | 'block';
    if (totalScore >= thresholds.block) action = 'block';
    else if (totalScore >= thresholds.flag) action = 'flag';
    else action = 'allow';

    // Log tout (allow inclus pour analyse)
    await this.logRepo.save(
      this.logRepo.create({
        missionId: missionId || null,
        senderId: senderId || null,
        originalMessage: content,
        normalizedMessage: normalized,
        action,
        score: totalScore,
        reasons,
        phase,
      }),
    );

    return { action, score: totalScore, reasons, phase };
  }

  async getLogs(filters: {
    action?: string;
    senderId?: string;
    phase?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = this.logRepo.createQueryBuilder('log');
    if (filters.action) query.andWhere('log.action = :action', { action: filters.action });
    if (filters.senderId) query.andWhere('log.senderId = :senderId', { senderId: filters.senderId });
    if (filters.phase) query.andWhere('log.phase = :phase', { phase: filters.phase });
    query.orderBy('log.createdAt', 'DESC');
    query.take(filters.limit ?? 50);
    query.skip(filters.offset ?? 0);
    return query.getManyAndCount();
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [blockedToday, flaggedToday, totalLogs] = await Promise.all([
      this.logRepo.count({ where: { action: 'block', createdAt: today as unknown as Date } }),
      this.logRepo.count({ where: { action: 'flag', createdAt: today as unknown as Date } }),
      this.logRepo.count(),
    ]);
    return { blockedToday, flaggedToday, totalLogs };
  }
}
