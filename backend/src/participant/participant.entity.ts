import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Meeting } from '../meeting/meeting.entity';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @ManyToOne(() => Meeting, meeting => meeting.participants)
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;
}
