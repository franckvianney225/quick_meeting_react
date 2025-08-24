import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Meeting } from '../meeting/meeting.entity';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  name: string = '';

  @Column()
  prenom: string = '';

  @Column()
  email: string = '';

  @Column()
  phone: string = '';

  @Column()
  fonction: string = '';

  @Column()
  organisation: string = '';

  @Column('text')
  signature: string = '';

  @ManyToOne(() => Meeting, meeting => meeting.participants)
  @JoinColumn({ name: 'meeting_id' })
  meeting!: Meeting;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt!: Date;

  @Column({ name: 'signature_date', type: 'timestamp', nullable: true })
  signatureDate?: Date;
}
