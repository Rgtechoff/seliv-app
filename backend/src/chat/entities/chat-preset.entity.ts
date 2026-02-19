import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chat_presets')
export class ChatPreset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  label: string;

  @Column({ type: 'varchar', nullable: true })
  role: string | null;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
