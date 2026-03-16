import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('moderation_logs')
export class ModerationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id', type: 'varchar', nullable: true })
  missionId: string | null;

  @Column({ name: 'sender_id', type: 'varchar', nullable: true })
  senderId: string | null;

  @Column({ name: 'original_message', type: 'text' })
  originalMessage: string;

  @Column({ name: 'normalized_message', type: 'text' })
  normalizedMessage: string;

  @Column({ type: 'varchar', length: 10 })
  action: string; // 'allow' | 'flag' | 'block'

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'text', array: true, default: [] })
  reasons: string[];

  @Column({ type: 'varchar', length: 20 })
  phase: string; // 'pre_acceptance' | 'post_acceptance'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
