import { Injectable, OnModuleInit, NotFoundException, ConflictException } from '@nestjs/common';
import type { PricingCategory } from './entities/pricing-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingConfig } from './entities/pricing-config.entity';

const DEFAULT_PRICING: Omit<PricingConfig, 'id' | 'updatedAt'>[] = [
  // Tarifs horaires (centimes)
  { key: 'rate_30', label: '30 articles — tarif/h', category: 'hourly_rate', valueCentimes: 8000 },
  { key: 'rate_50', label: '50 articles — tarif/h', category: 'hourly_rate', valueCentimes: 9000 },
  { key: 'rate_100', label: '100 articles — tarif/h', category: 'hourly_rate', valueCentimes: 11000 },
  { key: 'rate_200', label: '200+ articles — tarif/h', category: 'hourly_rate', valueCentimes: 14000 },
  // Options
  { key: 'option_prep_30', label: 'Préparation Pack 30', category: 'option', valueCentimes: 4900 },
  { key: 'option_prep_50', label: 'Préparation Pack 50', category: 'option', valueCentimes: 7900 },
  { key: 'option_prep_100', label: 'Préparation Pack 100', category: 'option', valueCentimes: 12900 },
  { key: 'option_prep_200', label: 'Préparation Pack 200-500', category: 'option', valueCentimes: 19900 },
  { key: 'option_etiquetage_30', label: 'Étiquetage 30 articles', category: 'option', valueCentimes: 1500 },
  { key: 'option_etiquetage_50', label: 'Étiquetage 50 articles', category: 'option', valueCentimes: 2500 },
  { key: 'option_etiquetage_100', label: 'Étiquetage 100 articles', category: 'option', valueCentimes: 5000 },
  { key: 'option_conditionnement', label: 'Conditionnement léger (≤5kg)', category: 'option', valueCentimes: 2900 },
  { key: 'option_creation_compte', label: 'Création compte Whatnot/TikTok', category: 'option', valueCentimes: 3900 },
  { key: 'option_script_live', label: 'Script / Organisation Live', category: 'option', valueCentimes: 5900 },
];

@Injectable()
export class PricingConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(PricingConfig)
    private readonly repo: Repository<PricingConfig>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const item of DEFAULT_PRICING) {
      const exists = await this.repo.findOne({ where: { key: item.key } });
      if (!exists) {
        await this.repo.save(this.repo.create(item));
      }
    }
  }

  async getAll(): Promise<PricingConfig[]> {
    return this.repo.find({ order: { category: 'ASC', key: 'ASC' } });
  }

  async getByKey(key: string): Promise<PricingConfig | null> {
    return this.repo.findOne({ where: { key } });
  }

  async create(data: { key: string; label: string; category: PricingCategory; valueCentimes: number }): Promise<PricingConfig> {
    const exists = await this.repo.findOne({ where: { key: data.key } });
    if (exists) throw new ConflictException(`La clé "${data.key}" existe déjà`);
    return this.repo.save(this.repo.create(data));
  }

  async remove(key: string): Promise<void> {
    const config = await this.repo.findOne({ where: { key } });
    if (!config) throw new NotFoundException(`Pricing key "${key}" not found`);
    await this.repo.delete(config.id);
  }

  async updateByKey(key: string, valueCentimes: number, label?: string): Promise<PricingConfig> {
    const config = await this.repo.findOne({ where: { key } });
    if (!config) throw new NotFoundException(`Pricing key "${key}" not found`);
    config.valueCentimes = valueCentimes;
    if (label !== undefined) config.label = label;
    return this.repo.save(config);
  }

  // Helper used by PricingService
  async getHourlyRate(volume: '30' | '50' | '100' | '200'): Promise<number> {
    const config = await this.repo.findOne({ where: { key: `rate_${volume}` } });
    // Fallback to hardcoded if not found (safety)
    const defaults: Record<string, number> = { '30': 8000, '50': 9000, '100': 11000, '200': 14000 };
    return config?.valueCentimes ?? defaults[volume] ?? 9000;
  }

  async getOptionPrice(optionKey: string): Promise<number> {
    const dbKey = `option_${optionKey}`;
    const config = await this.repo.findOne({ where: { key: dbKey } });
    return config?.valueCentimes ?? 0;
  }
}
