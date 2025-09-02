import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';

interface ParticipantResponse {
  id: number;
  name: string;
  prenom: string;
  email: string;
  phone: string;
  fonction: string;
  organisation: string;
  signature: string;
  meetingId: number;
  registeredAt: string;
  submittedAt?: string;
  signatureDate?: string;
  location?: string;
}
import { Participant } from '../participant/participant.entity';
import { v4 as uuidv4 } from 'uuid';
import { QrCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
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
    meetingstartdate?: string;
    meetingenddate?: string;
    qrConfig?: {
      backgroundColor?: string;
      foregroundColor?: string;
      size?: number;
      includeMargin?: boolean;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
      includeText?: boolean;
      customText?: string;
      logoUrl?: string;
    };
  }, userId?: number): Promise<Meeting> {
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

    // Convertir les dates de début et fin de réunion si fournies
    const meetingStartDate = meetingData.meetingstartdate ? new Date(meetingData.meetingstartdate) : undefined;
    const meetingEndDate = meetingData.meetingenddate ? new Date(meetingData.meetingenddate) : undefined;

    const meeting = this.meetingRepository.create({
      title: meetingData.title.toUpperCase(), // Forcer le titre en majuscules
      description: meetingData.description,
      status: 'active', // Toujours créer les réunions avec le statut 'active'
      location: meetingData.location,
      maxParticipants: meetingData.max_participants,
      startDate: startDate,
      meetingStartDate: meetingStartDate,
      meetingEndDate: meetingEndDate,
      uniqueCode: uniqueCode,
      qrConfig: meetingData.qrConfig || null,
      createdBy: userId ? { id: userId } : null,
      createdById: userId || null
    });

    // Enregistrer une seule fois avec le QR code
    meeting.qrCode = await this.qrCodeService.generateMeetingQRCode(meeting.uniqueCode);
    return await this.meetingRepository.save(meeting);
  }

  async findAll(userId?: number): Promise<Meeting[]> {
    const where = userId ? { createdById: userId } : {};
    return this.meetingRepository.find({
      where,
      order: { createdAt: 'DESC' }, // Tri par date de création descendante
      relations: ['createdBy'] // Charger la relation createdBy
    });
  }

  async findOne(id: number): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: ['createdBy'] // Charger la relation createdBy
    });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async findOneByCode(uniqueCode: string): Promise<Meeting | null> {
    return this.meetingRepository.findOne({ where: { uniqueCode } });
  }

  async update(id: number, meetingData: Partial<Meeting> & {
    meetingstartdate?: string;
    meetingenddate?: string;
  }): Promise<Meeting> {
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

    // Convertir les dates de début et fin de réunion si fournies
    if (meetingData.meetingstartdate) {
      meetingData.meetingStartDate = new Date(meetingData.meetingstartdate);
      delete meetingData.meetingstartdate;
    }

    if (meetingData.meetingenddate) {
      meetingData.meetingEndDate = new Date(meetingData.meetingenddate);
      delete meetingData.meetingenddate;
    }

    // Forcer le titre en majuscules si présent dans les données de mise à jour
    if (meetingData.title) {
      meetingData.title = meetingData.title.toUpperCase();
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
    
    // Vérifier si la réunion a des participants
    const participants = await this.participantRepository.find({
      where: { meeting: { id } }
    });
    
    if (participants.length > 0) {
      throw new Error('OUPPS VOUS NE POUVEZ PAS SUPPRIMER UNE REUNION AVEC DES PARTICIPANTS DEJA ENREGISTRES');
    }
    
    await this.meetingRepository.remove(meeting);
  }

  async getMeetingParticipants(meetingId: number): Promise<ParticipantResponse[]> {
    const participants = await this.participantRepository.find({
      where: { meeting: { id: meetingId } },
      relations: ['meeting']
    });

    return participants.map(p => ({
      id: p.id,
      name: p.name,
      prenom: p.prenom,
      email: p.email,
      phone: p.phone,
      fonction: p.fonction,
      organisation: p.organisation,
      signature: p.signature,
      meetingId: p.meeting?.id || 0,
      registeredAt: p.meeting?.createdAt.toISOString() || new Date().toISOString(),
      submittedAt: p.submittedAt?.toISOString(),
      signatureDate: p.signatureDate?.toISOString(),
      location: p.location
    }));
  }

  async registerParticipant(
    meetingCode: string,
    participantData: {
      email: string;
      firstName: string;
      lastName: string;
      company?: string;
      position?: string;
      phone: string;
      signature: string;
      agreedToTerms: boolean;
      location?: string;
    }
  ): Promise<boolean> {
    const meeting = await this.findOneByCode(meetingCode);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const participant = this.participantRepository.create({
      name: participantData.lastName,
      prenom: participantData.firstName,
      email: participantData.email,
      phone: participantData.phone,
      fonction: participantData.position || '',
      organisation: participantData.company || '',
      signature: participantData.signature,
      location: participantData.location,
      meeting: meeting
    });

    await this.participantRepository.save(participant);
    return true;
  }

  async generateQRCode(
    meetingId: number,
    url: string,
    config?: {
      color?: {
        dark?: string;
        light?: string;
      };
      size?: number;
    }
  ): Promise<Buffer> {
    const meeting = await this.findOne(meetingId);

    if (!meeting.uniqueCode) {
      throw new Error('Meeting has no unique code');
    }

    try {
      return await this.qrCodeService.generateQRCode(url, {
        color: {
          dark: config?.color?.dark || '#000000',
          light: config?.color?.light || '#ffffff'
        },
        width: config?.size || 200
      });
    } catch (err) {
      console.error('Erreur génération QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  }

  async getMeetingStatusByCode(code: string): Promise<{ status: string; title: string }> {
    const meeting = await this.meetingRepository.findOne({
      where: { uniqueCode: code.toUpperCase() }
    });

    if (!meeting) {
      throw new Error('Réunion non trouvée');
    }

    return {
      status: meeting.status,
      title: meeting.title
    };
  }

  /**
   * Valide que l'ID et le code correspondent à la même réunion
   * @param meetingId L'ID de la réunion fourni dans l'URL
   * @param code Le code unique de la réunion fourni dans l'URL
   * @returns La réunion si les deux paramètres sont cohérents, sinon lance une erreur
   */
  async validateMeetingIdAndCode(meetingId: number, code: string): Promise<{ status: string; title: string }> {
    // Récupérer la réunion par son code unique
    const meeting = await this.meetingRepository.findOne({
      where: { uniqueCode: code.toUpperCase() }
    });

    if (!meeting) {
      throw new Error('Réunion non trouvée avec ce code');
    }

    // Vérifier que l'ID fourni correspond bien à cette réunion
    if (meeting.id !== meetingId) {
      throw new Error('Incohérence entre l\'identifiant et le code de la réunion');
    }

    return {
      status: meeting.status,
      title: meeting.title
    };
  }
}