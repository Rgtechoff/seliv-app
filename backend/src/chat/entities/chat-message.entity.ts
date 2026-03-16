import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_preset', default: false })
  isPreset: boolean;

  @Column({ name: 'is_flagged', default: false })
  isFlagged: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({
    name: 'chat_phase',
    type: 'varchar',
    length: 20,
    default: 'post_acceptance',
  })
  chatPhase: string; // 'pre_acceptance' | 'post_acceptance'

  @Column({
    name: 'moderation_action',
    type: 'varchar',
    length: 10,
    default: 'allow',
  })
  moderationAction: string; // 'allow' | 'flag' | 'block'

  @Column({ name: 'moderation_score', type: 'int', default: 0 })
  moderationScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
