import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MissionStatus } from '../../common/enums/mission-status.enum';
import { VolumeEnum } from '../../common/enums/volume.enum';
import { User } from '../../users/entities/user.entity';

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'vendeur_id', nullable: true })
  vendeurId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'vendeur_id' })
  vendeur: User | null;

  @Column({ name: 'moderateur_id', nullable: true })
  moderateurId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderateur_id' })
  moderateur: User | null;

  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.DRAFT })
  status: MissionStatus;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_hours', type: 'int' })
  durationHours: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: VolumeEnum })
  volume: VolumeEnum;

  @Column({ name: 'base_price', type: 'int' })
  basePrice: number;

  @Column({ name: 'options_price', type: 'int', default: 0 })
  optionsPrice: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ name: 'total_price', type: 'int' })
  totalPrice: number;

  @Column({ name: 'stripe_payment_id', type: 'varchar', nullable: true })
  stripePaymentId: string | null;

  @Column({ name: 'stripe_checkout_session_id', type: 'varchar', nullable: true })
  stripeCheckoutSessionId: string | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'refund_amount', type: 'int', nullable: true })
  refundAmount: number | null;

  @Column({ name: 'refund_stripe_id', type: 'varchar', nullable: true })
  refundStripeId: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
