import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { MissionStatus } from '../../common/enums/mission-status.enum';

@Injectable()
export class SuperAdminAnalyticsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
  ) {}

  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      missionsThisMonth,
      missionsLastMonth,
      totalClients,
      totalVendeurs,
      activeSubscriptions,
    ] = await Promise.all([
      this.missionRepo
        .createQueryBuilder('m')
        .where('m.createdAt >= :start', { start: startOfMonth })
        .getMany(),
      this.missionRepo
        .createQueryBuilder('m')
        .where('m.createdAt >= :start AND m.createdAt <= :end', {
          start: startOfLastMonth,
          end: endOfLastMonth,
        })
        .getMany(),
      this.userRepo.count({ where: { role: UserRole.CLIENT } }),
      this.userRepo.count({ where: { role: UserRole.VENDEUR } }),
      this.subRepo
        .createQueryBuilder('s')
        .where("s.status = 'active'")
        .getCount(),
    ]);

    const paidStatuses: MissionStatus[] = [
      MissionStatus.PAID,
      MissionStatus.ASSIGNED,
      MissionStatus.IN_PROGRESS,
      MissionStatus.COMPLETED,
    ];

    const revenueThisMonth = missionsThisMonth
      .filter((m) => paidStatuses.includes(m.status))
      .reduce((sum, m) => sum + (m.totalPrice ?? 0), 0);

    const revenueLastMonth = missionsLastMonth
      .filter((m) => paidStatuses.includes(m.status))
      .reduce((sum, m) => sum + (m.totalPrice ?? 0), 0);

    const revenueGrowthPercent =
      revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
        : 0;

    const completedThisMonth = missionsThisMonth.filter(
      (m) => m.status === MissionStatus.COMPLETED,
    ).length;

    const completionRate =
      missionsThisMonth.length > 0
        ? Math.round((completedThisMonth / missionsThisMonth.length) * 100)
        : 0;

    const topVendeurs = await this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.VENDEUR })
      .orderBy('u.totalRevenueGeneratedCents', 'DESC')
      .limit(5)
      .getMany();

    const topClients = await this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.CLIENT })
      .orderBy('u.lifetimeValueCents', 'DESC')
      .limit(5)
      .getMany();

    return {
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowthPercent,
      missionsThisMonth: missionsThisMonth.length,
      missionsCompleted: completedThisMonth,
      missionsCancelled: missionsThisMonth.filter(
        (m) => m.status === MissionStatus.CANCELLED,
      ).length,
      completionRate,
      totalClients,
      totalVendeurs,
      activeSubscriptions,
      topVendeurs: topVendeurs.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        level: u.level,
        isStar: u.isStar,
        totalRevenue: u.totalRevenueGeneratedCents,
        avatarUrl: u.avatarUrl,
      })),
      topClients: topClients.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        company: u.companyName,
        ltv: u.lifetimeValueCents,
        missionsTotal: u.missionsTotal,
      })),
    };
  }

  async getRevenueChart(): Promise<Array<{ month: string; revenue: number }>> {
    const results = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const missions = await this.missionRepo
        .createQueryBuilder('m')
        .where('m.createdAt >= :start AND m.createdAt <= :end', { start, end })
        .andWhere('m.status IN (:...statuses)', {
          statuses: ['paid', 'assigned', 'in_progress', 'completed'],
        })
        .getMany();
      const revenue = missions.reduce((sum, m) => sum + (m.totalPrice ?? 0), 0);
      results.push({ month: start.toISOString().slice(0, 7), revenue });
    }
    return results;
  }

  async getMissionsChart(): Promise<
    Array<{ month: string; completed: number; cancelled: number; total: number }>
  > {
    const results = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const missions = await this.missionRepo
        .createQueryBuilder('m')
        .where('m.createdAt >= :start AND m.createdAt <= :end', { start, end })
        .getMany();
      results.push({
        month: start.toISOString().slice(0, 7),
        total: missions.length,
        completed: missions.filter((m) => m.status === MissionStatus.COMPLETED).length,
        cancelled: missions.filter((m) => m.status === MissionStatus.CANCELLED).length,
      });
    }
    return results;
  }
}
