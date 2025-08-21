// src/entities/user.entity.ts
import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Meeting } from '../meeting/meeting.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ type: 'varchar', length: 255 })
  name: string = '';

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string = '';

  @Column({ type: 'varchar', length: 255 })
  password: string = '';

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string = 'user';

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string = 'pending';

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null = null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null = null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null = null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string | null = null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  civility: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null = null;

  @Column({ type: 'integer', nullable: true })
  entreprise_id: number | null = null;

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();

  @Column({ type: 'varchar', length: 255, nullable: true })
  activation_token: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  activation_token_expires: Date | null = null;

  @OneToMany(() => Meeting, meeting => meeting.createdBy)
  meetings!: Meeting[];
}
