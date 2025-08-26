import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './participant.entity';
import { MeetingService } from '../meeting/meeting.service';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
    private meetingService: MeetingService
  ) {}

  async create(uniqueCode: string, participantData: CreateParticipantDto) {
    const meeting = await this.meetingService.findOneByCode(uniqueCode);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const participant = this.participantRepository.create({
      ...participantData,
      meeting
    });
    
    // S'assurer que submittedAt est défini avec la date/heure actuelle
    participant.submittedAt = new Date();
    
    // Définir la date de signature avec la date/heure actuelle
    participant.signatureDate = new Date();

    return this.participantRepository.save(participant);
  }

  async findAllByMeeting(meetingCode: string) {
    const meeting = await this.meetingService.findOneByCode(meetingCode);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    return this.participantRepository.find({
      where: { meeting: { id: meeting.id } },
      order: { createdAt: 'ASC' } // Tri par date de création ascendante
    });
  }

  async findByEmail(email: string) {
    return this.participantRepository.find({
      where: { email },
      relations: ['meeting'],
      order: { createdAt: 'DESC' } // Récupérer le participant le plus récent
    });
  }

  async isAlreadyRegistered(email: string, meetingCode: string): Promise<boolean> {
    const meeting = await this.meetingService.findOneByCode(meetingCode);
    if (!meeting) {
      return false;
    }

    const existingParticipant = await this.participantRepository.findOne({
      where: {
        email,
        meeting: { id: meeting.id }
      }
    });

    return !!existingParticipant;
  }

  async remove(id: number): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { id },
      relations: ['meeting']
    });
    
    if (!participant) {
      throw new Error('Participant not found');
    }

    await this.participantRepository.remove(participant);
  }
}