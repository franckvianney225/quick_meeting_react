import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ type: 'varchar', length: 100 })
  deviceType: string;

  @Column({ type: 'varchar', length: 100 })
  browser: string;

  @Column({ type: 'varchar', length: 100 })
  os: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActivity: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  // Méthode pour vérifier si la session est expirée
  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  // Méthode pour vérifier si la session est active
  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }
}