import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceItem } from './entities/service-item.entity';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';

@Injectable()
export class ServicesCatalogService {
  constructor(
    @InjectRepository(ServiceItem) private repo: Repository<ServiceItem>,
  ) {}

  findAllActive(): Promise<ServiceItem[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { category: 'ASC', sortOrder: 'ASC' },
    });
  }

  findAll(): Promise<ServiceItem[]> {
    return this.repo.find({ order: { category: 'ASC', sortOrder: 'ASC' } });
  }

  findByLegacyKey(key: string): Promise<ServiceItem | null> {
    return this.repo.findOne({ where: { legacyKey: key, isActive: true } });
  }

  async create(dto: CreateServiceItemDto): Promise<ServiceItem> {
    const item = this.repo.create({
      ...dto,
      priceType: dto.priceType ?? 'fixed',
      minQuantity: dto.minQuantity ?? 1,
      maxQuantity: dto.maxQuantity ?? null,
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateServiceItemDto): Promise<ServiceItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Service item not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async softDelete(id: string): Promise<ServiceItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Service item not found');
    item.isActive = false;
    return this.repo.save(item);
  }

  async reorder(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id, i) => this.repo.update({ id }, { sortOrder: i })),
    );
  }
}
