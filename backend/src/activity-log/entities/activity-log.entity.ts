import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('activity_logs')
@Index(['createdAt', 'action'])
@Index(['actorId'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_id', type: 'varchar', nullable: true })
  actorId: string | null;

  @Column({ name: 'actor_role', type: 'varchar', nullable: true })
  actorRole: string | null;

  @Column()
  action: string;

  @Column({ name: 'target_type', type: 'varchar', nullable: true })
  targetType: string | null;

  @Column({ name: 'target_id', type: 'varchar', nullable: true })
  targetId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
