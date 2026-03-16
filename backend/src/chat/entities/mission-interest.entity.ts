import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('mission_interests')
@Unique(['missionId', 'vendeurId'])
export class MissionInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'vendeur_id' })
  vendeurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendeur_id' })
  vendeur: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
