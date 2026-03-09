import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';
import { Review } from '../../reviews/entities/review.entity';
import { ActivityLog } from '../../activity-log/entities/activity-log.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { VendorLevel } from '../../common/enums/vendor-level.enum';

@Injectable()
export class SuperAdminVendeursService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
  ) {}

  findAll(filters: { level?: VendorLevel; isSuspended?: boolean } = {}): Promise<User[]> {
    return this.repo.find({
      where: {
        role: UserRole.VENDEUR,
        ...(filters.level !== undefined && { level: filters.level }),
        ...(filters.isSuspended !== undefined && { isSuspended: filters.isSuspended }),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id, role: UserRole.VENDEUR } });
    if (!user) throw new NotFoundException('Vendeur not found');
    return user;
  }

  async suspend(id: string, reason: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.isSuspended = true;
    user.suspensionReason = reason;
    user.suspendedAt = new Date();
    return this.repo.save(user);
  }

  async unsuspend(id: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.isSuspended = false;
    user.suspensionReason = null;
    user.suspendedAt = null;
    return this.repo.save(user);
  }

  async updateLevel(id: string, level: VendorLevel): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.level = level;
    return this.repo.save(user);
  }

  async toggleStar(id: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.isStar = !user.isStar;
    return this.repo.save(user);
  }

  async updateCommission(id: string, commissionRate: number): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.commissionRate = commissionRate;
    return this.repo.save(user);
  }

  async findHistory(id: string) {
    const vendeur = await this.findOneOrFail(id);
    const [missions, reviews, logs] = await Promise.all([
      this.missionRepo.find({
        where: { vendeurId: id },
        order: { date: 'DESC' },
        take: 100,
      }),
      this.reviewRepo.find({
        where: { vendeurId: id },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
      this.logRepo.find({
        where: { actorId: id },
        order: { createdAt: 'DESC' },
        take: 100,
      }),
    ]);
    return { vendeur, missions, reviews, logs };
  }

  getPerformanceRanking(): Promise<User[]> {
    return this.repo.find({
      where: { role: UserRole.VENDEUR, isValidated: true },
      order: { totalRevenueGeneratedCents: 'DESC' },
      take: 20,
    });
  }
}
