import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private repo: Repository<Plan>,
    private dataSource: DataSource,
  ) {}

  findAllActive(): Promise<Plan[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findAll(): Promise<Plan[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  async findAllWithSubscriberCount(): Promise<Array<Plan & { subscriberCount: number }>> {
    const plans = await this.findAll();
    // Count active subscriptions by plan slug
    const counts = await this.dataSource.query<Array<{ plan: string; count: string }>>(
      `SELECT plan, COUNT(*) as count FROM subscriptions WHERE status = 'active' GROUP BY plan`,
    );
    const countMap = new Map<string, number>(
      counts.map((r) => [r.plan, parseInt(r.count, 10)]),
    );
    return plans.map((p) => ({
      ...p,
      subscriberCount: countMap.get(p.slug) ?? 0,
    }));
  }

  findById(id: string): Promise<Plan | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Plan | null> {
    return this.repo.findOne({ where: { slug, isActive: true } });
  }

  async create(dto: CreatePlanDto): Promise<Plan> {
    const slug = generateSlug(dto.name);
    const plan = this.repo.create({
      ...dto,
      slug,
      features: dto.features ?? [],
      billingPeriod: dto.billingPeriod ?? 'monthly',
      hourlyDiscountCents: dto.hourlyDiscountCents ?? 0,
      canAccessStar: dto.canAccessStar ?? false,
      priorityLevel: dto.priorityLevel ?? 0,
      maxMissionsPerMonth: dto.maxMissionsPerMonth ?? null,
    });
    return this.repo.save(plan);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (dto.name) plan.slug = generateSlug(dto.name);
    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async softDelete(id: string): Promise<Plan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    plan.isActive = false;
    return this.repo.save(plan);
  }

  async reorder(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id, index) => this.repo.update({ id }, { sortOrder: index })),
    );
  }
}
