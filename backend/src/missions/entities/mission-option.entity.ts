import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from './mission.entity';

@Entity('mission_options')
export class MissionOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'option_type' })
  optionType: string;

  @Column({ name: 'option_detail', type: 'varchar', nullable: true })
  optionDetail: string | null;

  @Column({ type: 'int' })
  price: number;
}
