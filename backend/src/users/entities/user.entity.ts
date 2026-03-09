import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { VendorLevel } from '../../common/enums/vendor-level.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'phone_encrypted', type: 'varchar', nullable: true })
  phoneEncrypted: string | null;

  @Column({ name: 'company_name', type: 'varchar', nullable: true })
  companyName: string | null;

  @Column({ type: 'varchar', nullable: true })
  siret: string | null;

  @Column({ type: 'text', array: true, default: [] })
  zones: string[];

  @Column({ type: 'text', array: true, default: [] })
  categories: string[];

  @Column({
    type: 'enum',
    enum: VendorLevel,
    default: VendorLevel.DEBUTANT,
    nullable: true,
  })
  level: VendorLevel | null;

  @Column({ name: 'is_star', default: false })
  isStar: boolean;

  @Column({ name: 'is_validated', default: false })
  isValidated: boolean;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'stripe_customer_id', type: 'varchar', nullable: true })
  stripeCustomerId: string | null;

  @Column({ name: 'can_moderate', default: false })
  canModerate: boolean;

  // Vendeur fields
  @Column({ name: 'commission_rate', type: 'decimal', nullable: true })
  commissionRate: number | null;

  @Column({ name: 'onboarding_completed_at', type: 'timestamp', nullable: true })
  onboardingCompletedAt: Date | null;

  @Column({ name: 'last_active_at', type: 'timestamp', nullable: true })
  lastActiveAt: Date | null;

  @Column({ name: 'total_revenue_generated_cents', type: 'int', default: 0 })
  totalRevenueGeneratedCents: number;

  @Column({ name: 'suspension_reason', type: 'text', nullable: true })
  suspensionReason: string | null;

  @Column({ name: 'suspended_at', type: 'timestamp', nullable: true })
  suspendedAt: Date | null;

  // Client fields
  @Column({ name: 'lifetime_value_cents', type: 'int', default: 0 })
  lifetimeValueCents: number;

  @Column({ name: 'missions_total', type: 'int', default: 0 })
  missionsTotal: number;

  @Column({ name: 'last_mission_at', type: 'timestamp', nullable: true })
  lastMissionAt: Date | null;

  @Column({ name: 'notes_admin', type: 'text', nullable: true })
  notesAdmin: string | null;

  @Column({ name: 'is_suspended', default: false })
  isSuspended: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
