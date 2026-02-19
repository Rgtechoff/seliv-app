import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  MISSION_CREATED = 'mission_created',
  VENDEUR_ASSIGNED = 'vendeur_assigned',
  MISSION_REMINDER = 'mission_reminder',
  MISSION_COMPLETED = 'mission_completed',
  MISSION_CANCELLED = 'mission_cancelled',
  NEW_CHAT_MESSAGE = 'new_chat_message',
  CHAT_MESSAGE_FLAGGED = 'chat_message_flagged',
  VENDEUR_VALIDATED = 'vendeur_validated',
  NEW_MISSION_AVAILABLE = 'new_mission_available',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'mission_id', type: 'varchar', nullable: true })
  missionId: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_email_sent', default: false })
  isEmailSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
