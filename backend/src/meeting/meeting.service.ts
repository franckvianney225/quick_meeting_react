import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import { v4 as uuidv4 } from 'uuid';
import { QrCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    private qrCodeService: QrCodeService
  ) {}

  async create(meetingData: {
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'inactive';
    location: string;
    max_participants?: number;
    start_date?: string;
    startDate?: string;
  }): Promise<Meeting> {
    // Normaliser le nom du champ date (support ancien et nouveau format)
    const dateString = meetingData.startDate ||
                      (meetingData.start_date ? new Date(meetingData.start_date).toISOString() : undefined);
    
    if (!dateString) {
      throw new Error('Start date is required');
    }

    // Valider et parser la date
    const startDate = new Date(dateString);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid date format');
    }
    if (isNaN(startDate.getTime())) {
      throw new Error('Format de date invalide');
    }

    // Générer un code unique de 8 caractères alphanumériques
    const generateUniqueCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };
    
    let uniqueCode = generateUniqueCode();
    // Vérifier que le code est unique
    while (await this.findOneByCode(uniqueCode)) {
      uniqueCode = generateUniqueCode();
    }

    const meeting = this.meetingRepository.create({
      title: meetingData.title,
      description: meetingData.description,
      status: meetingData.status,
      location: meetingData.location,
      maxParticipants: meetingData.max_participants,
      startDate: startDate,
      uniqueCode: uniqueCode
    });

    // Enregistrer une seule fois avec le QR code
    meeting.qrCode = await this.qrCodeService.generateMeetingQRCode(meeting.uniqueCode);
    return this.meetingRepository.save(meeting);
  }

  async findAll(): Promise<Meeting[]> {
    return this.meetingRepository.find();
  }

  async findOne(id: number): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({ where: { id } });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async findOneByCode(uniqueCode: string): Promise<Meeting | null> {
    return this.meetingRepository.findOne({ where: { uniqueCode } });
  }

  async update(id: number, meetingData: Partial<Meeting>): Promise<Meeting> {
    const meeting = await this.findOne(id);
    
    // Validation des données
    if (meetingData.start_date && isNaN(new Date(meetingData.start_date).getTime())) {
      throw new Error('Format de date invalide');
    }

    // Ne pas modifier le code unique lors des mises à jour
    if (meetingData.uniqueCode) {
      delete meetingData.uniqueCode;
    }

    // Convertir la date si nécessaire
    if (meetingData.start_date) {
      meetingData.startDate = new Date(meetingData.start_date);
      delete meetingData.start_date;
    }

    Object.assign(meeting, meetingData);
    
    try {
      return await this.meetingRepository.save(meeting);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      throw new Error(err.message || 'Erreur lors de la mise à jour');
    }
  }

  async remove(id: number): Promise<void> {
    const meeting = await this.findOne(id);
    await this.meetingRepository.remove(meeting);
  }
}