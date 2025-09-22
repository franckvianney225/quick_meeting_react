import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Meeting } from '../meeting/meeting.entity';

export enum ActivityType {
  MEETING_CREATED = 'meeting_created',
  MEETING_UPDATED = 'meeting_updated',
  MEETING_CLOSED = 'meeting_closed',
  MEETING_REOPENED = 'meeting_reopened',
  MEETING_AUTO_CLOSED = 'meeting_auto_closed',
  ATTENDANCE_LIST_PRINTED = 'attendance_list_printed',
  QR_CODE_PRINTED = 'qr_code_printed',
  QR_CONFIG_UPDATED = 'qr_config_updated',
  PARTICIPANT_ADDED = 'participant_added',
  PARTICIPANT_REMOVED = 'participant_removed'
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column('text')
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Meeting, { eager: true })
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting;

  @Column()
  meetingId: number;
}