import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { MissionOption } from './entities/mission-option.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { MissionStatus } from '../common/enums/mission-status.enum';
import { PricingService } from './pricing.service';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';

// State machine: allowed transitions
const ALLOWED_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  [MissionStatus.DRAFT]: [MissionStatus.PENDING_PAYMENT, MissionStatus.CANCELLED],
  [MissionStatus.PENDING_PAYMENT]: [MissionStatus.PAID, MissionStatus.CANCELLED],
  [MissionStatus.PAID]: [MissionStatus.ASSIGNED, MissionStatus.CANCELLED],
  [MissionStatus.ASSIGNED]: [
    MissionStatus.IN_PROGRESS,
    MissionStatus.PAID,
    MissionStatus.CANCELLED,
  ],
  [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED],
  [MissionStatus.COMPLETED]: [],
  [MissionStatus.CANCELLED]: [],
};

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    @InjectRepository(MissionOption)
    private readonly optionRepo: Repository<MissionOption>,
    private readonly pricingService: PricingService,
  ) {}

  validateTransition(from: MissionStatus, to: MissionStatus): void {
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(
        `Cannot transition from ${from} to ${to}`,
      );
    }
  }

  async create(
    clientId: string,
    dto: CreateMissionDto,
    plan: SubscriptionPlan,
  ): Promise<Mission> {
    const missionDate = new Date(dto.date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    minDate.setHours(0, 0, 0, 0);
    if (missionDate < minDate) {
      throw new BadRequestException(
        'Mission date must be at least 2 days in the future',
      );
    }

    const optionPrices = dto.options.map((o) => o.price);
    const basePrice = this.pricingService.calculateBasePrice(
      dto.volume,
      dto.durationHours,
      plan,
    );
    const discount =
      this.pricingService.getHourlyDiscount(plan) * dto.durationHours;
    const optionsPrice = optionPrices.reduce((s, p) => s + p, 0);
    const totalPrice = basePrice + optionsPrice;

    const mission = this.missionRepo.create({
      clientId,
      status: MissionStatus.DRAFT,
      date: missionDate,
      startTime: dto.startTime,
      durationHours: dto.durationHours,
      address: dto.address,
      city: dto.city,
      category: dto.category,
      volume: dto.volume,
      basePrice,
      optionsPrice,
      discount,
      totalPrice,
    });

    const saved = await this.missionRepo.save(mission);

    if (dto.options.length > 0) {
      const options = dto.options.map((o) =>
        this.optionRepo.create({
          missionId: saved.id,
          optionType: o.optionType,
          optionDetail: o.optionDetail ?? null,
          price: o.price,
        }),
      );
      await this.optionRepo.save(options);
    }

    return saved;
  }

  async findById(id: string): Promise<Mission | null> {
    return this.missionRepo.findOne({
      where: { id },
      relations: ['client', 'vendeur'],
    });
  }

  async findByClientId(clientId: string): Promise<Mission[]> {
    return this.missionRepo.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByVendeurId(vendeurId: string): Promise<Mission[]> {
    return this.missionRepo.find({
      where: { vendeurId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableForVendeur(
    zones: string[],
    categories: string[],
  ): Promise<Mission[]> {
    if (!zones.length || !categories.length) return [];
    return this.missionRepo
      .createQueryBuilder('m')
      .where('m.status = :status', { status: MissionStatus.PAID })
      .andWhere('m.city IN (:...zones)', { zones })
      .andWhere('m.category IN (:...categories)', { categories })
      .orderBy('m.date', 'ASC')
      .getMany();
  }

  async assignVendeur(missionId: string, vendeurId: string): Promise<Mission> {
    const mission = await this.findById(missionId);
    if (!mission) throw new NotFoundException(`Mission ${missionId} not found`);
    this.validateTransition(mission.status, MissionStatus.ASSIGNED);
    mission.vendeurId = vendeurId;
    mission.status = MissionStatus.ASSIGNED;
    return this.missionRepo.save(mission);
  }

  async markInProgress(missionId: string): Promise<Mission> {
    const mission = await this.findById(missionId);
    if (!mission) throw new NotFoundException(`Mission ${missionId} not found`);
    this.validateTransition(mission.status, MissionStatus.IN_PROGRESS);
    mission.status = MissionStatus.IN_PROGRESS;
    return this.missionRepo.save(mission);
  }

  async markCompleted(missionId: string, vendeurId: string): Promise<Mission> {
    const mission = await this.findById(missionId);
    if (!mission) throw new NotFoundException(`Mission ${missionId} not found`);
    if (mission.vendeurId !== vendeurId) throw new ForbiddenException();
    this.validateTransition(mission.status, MissionStatus.COMPLETED);
    mission.status = MissionStatus.COMPLETED;
    mission.completedAt = new Date();
    return this.missionRepo.save(mission);
  }

  async cancel(
    missionId: string,
    requesterId: string,
    reason: string,
  ): Promise<{ mission: Mission; refundPercent: number }> {
    const mission = await this.findById(missionId);
    if (!mission) throw new NotFoundException(`Mission ${missionId} not found`);

    if (mission.status === MissionStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot cancel a mission in progress');
    }

    if (mission.clientId !== requesterId) {
      throw new ForbiddenException('Only the client can cancel their mission');
    }

    this.validateTransition(mission.status, MissionStatus.CANCELLED);

    const now = new Date();
    const missionDateTime = new Date(mission.date);
    const [hours, minutes] = mission.startTime.split(':').map(Number);
    missionDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    const hoursUntilMission =
      (missionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const refundPercent = hoursUntilMission >= 48 ? 100 : 50;

    mission.status = MissionStatus.CANCELLED;
    mission.cancelledAt = new Date();
    mission.cancellationReason = reason;

    const saved = await this.missionRepo.save(mission);
    return { mission: saved, refundPercent };
  }

  async updateStripeData(
    missionId: string,
    data: {
      stripePaymentId?: string;
      stripeCheckoutSessionId?: string;
      paidAt?: Date;
      status?: MissionStatus;
    },
  ): Promise<void> {
    await this.missionRepo.update(missionId, data);
  }

  async findAll(): Promise<Mission[]> {
    return this.missionRepo.find({
      relations: ['client', 'vendeur'],
      order: { createdAt: 'DESC' },
    });
  }
}
