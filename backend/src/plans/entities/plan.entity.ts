import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ name: 'billing_period', default: 'monthly' })
  billingPeriod: 'monthly' | 'yearly';

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ name: 'hourly_discount_cents', type: 'int', default: 0 })
  hourlyDiscountCents: number;

  @Column({ name: 'can_access_star', default: false })
  canAccessStar: boolean;

  @Column({ name: 'priority_level', type: 'int', default: 0 })
  priorityLevel: number;

  @Column({ name: 'max_missions_per_month', type: 'int', nullable: true })
  maxMissionsPerMonth: number | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'stripe_price_id', type: 'varchar', nullable: true })
  stripePriceId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
