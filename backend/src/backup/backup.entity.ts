import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column('bigint')
  size: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'success' | 'failed';

  @Column({ default: 'manual' })
  type: 'manual' | 'automatic';

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}