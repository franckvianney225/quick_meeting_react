import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Participant } from '../participant/participant.entity';

@Entity()
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column({ nullable: true })
  qrCode: string;

  @OneToMany(() => Participant, participant => participant.meeting)
  participants: Participant[];
}
