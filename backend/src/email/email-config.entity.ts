import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('email_config')
export class EmailConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  server: string;

  @Column()
  port: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  encryption: string;

  @Column({ name: 'from_email' })
  fromEmail: string;

  @Column({ name: 'from_name' })
  fromName: string;

  @Column({ nullable: true })
  timeout: number;

  @Column({ name: 'max_retries', nullable: true })
  maxRetries: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}