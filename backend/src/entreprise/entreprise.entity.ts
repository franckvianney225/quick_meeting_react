// src/entities/entreprise.entity.ts
import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('entreprises')
export class Entreprise {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ type: 'varchar', length: 255 })
  name: string = '';

  @Column({ type: 'text', nullable: true })
  address: string | null = null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null = null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string | null = null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string | null = null;

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();
}
