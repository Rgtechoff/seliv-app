import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'day_of_week', type: 'int', nullable: true })
  dayOfWeek: number | null; // 0=Sunday, 1=Monday, ..., 6=Saturday

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string | null;

  @Column({ name: 'date_specific', type: 'date', nullable: true })
  dateSpecific: Date | null;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;
}
