import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userEmail: string;

  @Column()
  action: string;

  @Column()
  resourceType: string;

  @Column({ nullable: true })
  resourceId?: number;

  @Column('jsonb', { default: {} })
  details: Record<string, unknown>;

  @Column({ nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  timestamp: Date;
}