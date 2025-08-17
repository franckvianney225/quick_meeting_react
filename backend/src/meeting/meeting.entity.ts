import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Participant } from '../participant/participant.entity';

@Entity()
export class Meeting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, name: 'unique_code' })
  uniqueCode!: string;

  @Column()
  title!: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate!: Date;

  // Champ temporaire pour la compatibilité
  @Column({ name: 'start_date_legacy', nullable: true, select: false })
  start_date?: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  status!: 'active' | 'completed' | 'inactive';

  @Column()
  location!: string;

  @Column({ name: 'max_participants', nullable: true })
  maxParticipants!: number;

  @Column({ name: 'qr_code', nullable: true })
  qrCode!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Participant, participant => participant.meeting)
  participants!: Participant[];
}
