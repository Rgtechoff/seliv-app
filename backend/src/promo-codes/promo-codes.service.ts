import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from './dto/create-promo-code.dto';

export interface PromoValidationResult {
  valid: boolean;
  promoCodeId: string;
  discountType: 'percent' | 'fixed' | 'free';
  discountValue: number;
  /** Amount to subtract in centimes (computed from basePrice + optionsPrice) */
  discountAmount: number;
  finalPrice: number;
}

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly repo: Repository<PromoCode>,
  ) {}

  async create(dto: CreatePromoCodeDto): Promise<PromoCode> {
    const existing = await this.repo.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Code "${dto.code}" déjà utilisé`);

    const promo = this.repo.create({
      code: dto.code.toUpperCase(),
      label: dto.label ?? null,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUses: dto.maxUses ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: dto.isActive !== false,
    });
    return this.repo.save(promo);
  }

  async findAll(): Promise<PromoCode[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PromoCode> {
    const promo = await this.repo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Code promo introuvable');
    return promo;
  }

  async update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCode> {
    const promo = await this.findOne(id);
    if (dto.label !== undefined) promo.label = dto.label;
    if (dto.discountType !== undefined) promo.discountType = dto.discountType;
    if (dto.discountValue !== undefined) promo.discountValue = dto.discountValue;
    if (dto.maxUses !== undefined) promo.maxUses = dto.maxUses;
    if (dto.expiresAt !== undefined) promo.expiresAt = new Date(dto.expiresAt);
    if (dto.isActive !== undefined) promo.isActive = dto.isActive;
    return this.repo.save(promo);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async validate(code: string, priceBeforePromo: number): Promise<PromoValidationResult> {
    const promo = await this.repo.findOne({ where: { code: code.toUpperCase() } });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Code promo invalide ou inactif');
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new BadRequestException('Code promo expiré');
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Ce code promo a atteint sa limite d\'utilisation');
    }

    let discountAmount = 0;
    if (promo.discountType === 'free') {
      discountAmount = priceBeforePromo;
    } else if (promo.discountType === 'percent') {
      discountAmount = Math.round((priceBeforePromo * promo.discountValue) / 100);
    } else {
      // fixed
      discountAmount = Math.min(promo.discountValue, priceBeforePromo);
    }

    return {
      valid: true,
      promoCodeId: promo.id,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalPrice: Math.max(0, priceBeforePromo - discountAmount),
    };
  }

  async incrementUsage(code: string): Promise<void> {
    await this.repo.increment({ code: code.toUpperCase() }, 'usedCount', 1);
  }
}
