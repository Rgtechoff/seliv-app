import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

export type PricingCategory = 'hourly_rate' | 'option';

@Entity('pricing_config')
export class PricingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // e.g. 'rate_30', 'rate_50', 'option_prep_30'

  @Column()
  label: string;

  @Column({ type: 'varchar' })
  category: PricingCategory; // 'hourly_rate' | 'option'

  @Column({ name: 'value_centimes', type: 'int' })
  valueCentimes: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
