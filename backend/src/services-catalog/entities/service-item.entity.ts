import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ServiceCategory =
  | 'preparation'
  | 'etiquetage'
  | 'conditionnement'
  | 'creation_compte'
  | 'script'
  | 'autre';

export type PriceType = 'fixed' | 'per_unit';

@Entity('service_items')
export class ServiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  category: ServiceCategory;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ name: 'price_type', default: 'fixed' })
  priceType: PriceType;

  @Column({ name: 'unit_label', type: 'varchar', nullable: true })
  unitLabel: string | null;

  @Column({ name: 'min_quantity', type: 'int', default: 1 })
  minQuantity: number;

  @Column({ name: 'max_quantity', type: 'int', nullable: true })
  maxQuantity: number | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  // For migration from OPTIONS_CATALOG hardcoded keys
  @Column({ name: 'legacy_key', type: 'varchar', nullable: true })
  legacyKey: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
