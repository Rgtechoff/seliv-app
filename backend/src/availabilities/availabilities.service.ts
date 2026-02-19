import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(
    @InjectRepository(Availability)
    private readonly repo: Repository<Availability>,
  ) {}

  async findByUser(userId: string): Promise<Availability[]> {
    return this.repo.find({ where: { userId }, order: { dayOfWeek: 'ASC', startTime: 'ASC' } });
  }

  async upsert(userId: string, dto: UpsertAvailabilityDto): Promise<Availability> {
    const avail = this.repo.create({ ...dto, userId });
    return this.repo.save(avail);
  }

  async remove(id: string, userId: string): Promise<void> {
    const avail = await this.repo.findOne({ where: { id } });
    if (!avail || avail.userId !== userId) throw new NotFoundException('Disponibilité introuvable');
    await this.repo.remove(avail);
  }

  async isVendeurAvailable(
    userId: string,
    date: string,
    startTime: string,
    durationHours: number,
  ): Promise<boolean> {
    const dayOfWeek = new Date(date).getDay();
    const [sh, sm] = startTime.split(':').map(Number);
    const endTotalMinutes = sh * 60 + sm + durationHours * 60;
    const endH = Math.floor(endTotalMinutes / 60);
    const endM = endTotalMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // Check specific date override first
    const specific = await this.repo.findOne({
      where: { userId, dateSpecific: new Date(date) },
    });
    if (specific) return specific.isAvailable;

    // Check recurring weekly slot
    const recurring = await this.repo
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .andWhere('a.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('a.startTime <= :startTime', { startTime })
      .andWhere('a.endTime >= :endTime', { endTime })
      .andWhere('a.isAvailable = true')
      .getOne();

    return !!recurring;
  }
}
