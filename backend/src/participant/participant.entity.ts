import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Meeting } from '../meeting/meeting.entity';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ name: 'first_name' })
  firstName: string = '';

  @Column({ name: 'last_name' })
  lastName: string = '';

  @Column()
  email: string = '';

  @Column()
  phone: string = '';

  @Column({ name: 'position' })
  position: string = '';

  @Column({ name: 'company' })
  company: string = '';

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

  @Column({ name: 'location', type: 'text', nullable: true })
  location?: string;

  @Column({ name: 'gender', type: 'varchar', length: 10, nullable: true })
  gender?: string;
}
