import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';
import { ActivityLog } from '../../activity-log/entities/activity-log.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class SuperAdminClientsService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find({
      where: { role: UserRole.CLIENT },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id, role: UserRole.CLIENT } });
    if (!user) throw new NotFoundException('Client not found');
    return user;
  }

  async updateNotes(id: string, notes: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.notesAdmin = notes;
    return this.repo.save(user);
  }

  async suspend(id: string, reason?: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.isSuspended = true;
    user.suspensionReason = reason ?? null;
    user.suspendedAt = new Date();
    return this.repo.save(user);
  }

  async unsuspend(id: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.isSuspended = false;
    user.suspendedAt = null;
    return this.repo.save(user);
  }

  async findHistory(id: string) {
    const client = await this.findOneOrFail(id);
    const [missions, logs] = await Promise.all([
      this.missionRepo.find({
        where: { clientId: id },
        order: { date: 'DESC' },
        take: 100,
      }),
      this.logRepo.find({
        where: { actorId: id },
        order: { createdAt: 'DESC' },
        take: 100,
      }),
    ]);
    return { client, missions, logs };
  }

  async getSegments() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const allClients = await this.repo.find({
      where: { role: UserRole.CLIENT },
      order: { createdAt: 'DESC' },
    });

    return {
      new: allClients.filter((c) => c.createdAt >= thirtyDaysAgo),
      active: allClients.filter(
        (c) => c.lastMissionAt && c.lastMissionAt >= thirtyDaysAgo,
      ),
      inactive: allClients.filter(
        (c) => !c.lastMissionAt || c.lastMissionAt < ninetyDaysAgo,
      ),
      topSpenders: [...allClients]
        .sort((a, b) => b.lifetimeValueCents - a.lifetimeValueCents)
        .slice(0, 10),
    };
  }
}
