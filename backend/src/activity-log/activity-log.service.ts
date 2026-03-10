import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

interface ActivityLogFilters {
  actorId?: string;
  action?: string;
  targetType?: string;
  fromDate?: string;
  toDate?: string;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog) private repo: Repository<ActivityLog>,
  ) {}

  async log(dto: CreateActivityLogDto): Promise<void> {
    try {
      const entry = this.repo.create(dto);
      await this.repo.save(entry);
    } catch {
      // Logging must never break business logic
    }
  }

  async findAll(
    filters: ActivityLogFilters = {},
  ): Promise<{ data: ActivityLog[]; nextCursor: string | null; total: number }> {
    const limit = Math.min(filters.limit ?? 50, 200);
    const qb = this.repo
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (filters.actorId) {
      qb.andWhere('log.actorId = :actorId', { actorId: filters.actorId });
    }
    if (filters.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters.targetType) {
      qb.andWhere('log.targetType = :targetType', { targetType: filters.targetType });
    }
    if (filters.fromDate) {
      qb.andWhere('log.createdAt >= :fromDate', { fromDate: filters.fromDate });
    }
    if (filters.toDate) {
      qb.andWhere('log.createdAt <= :toDate', { toDate: filters.toDate });
    }

    const total = await qb.getCount();

    if (filters.cursor) {
      const cursorDate = new Date(
        Buffer.from(filters.cursor, 'base64').toString(),
      );
      qb.andWhere('log.createdAt < :cursor', { cursor: cursorDate });
    }

    qb.limit(limit + 1);
    const results = await qb.getMany();
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor =
      hasMore
        ? Buffer.from(data[data.length - 1].createdAt.toISOString()).toString('base64')
        : null;

    return { data, nextCursor, total };
  }

  async exportCsv(filters: ActivityLogFilters = {}): Promise<string> {
    const { data } = await this.findAll({ ...filters, limit: 10000 });
    const header = 'id,actorId,actorRole,action,targetType,targetId,ipAddress,createdAt\n';
    const rows = data
      .map(
        (l) =>
          `${l.id},${l.actorId ?? ''},${l.actorRole ?? ''},${l.action},${l.targetType ?? ''},${l.targetId ?? ''},${l.ipAddress ?? ''},${l.createdAt.toISOString()}`,
      )
      .join('\n');
    return header + rows;
  }
}
