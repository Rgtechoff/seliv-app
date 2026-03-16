import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type DiscountType = 'percent' | 'fixed' | 'free';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g. 'ESSAI2024', 'BIENVENUE10'

  @Column({ nullable: true, type: 'varchar' })
  label: string | null;

  @Column({ name: 'discount_type', type: 'varchar' })
  discountType: DiscountType; // 'percent' | 'fixed' | 'free'

  @Column({ name: 'discount_value', type: 'int', default: 0 })
  discountValue: number; // percent: 0-100, fixed: centimes, free: ignored

  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number | null; // null = unlimited

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
