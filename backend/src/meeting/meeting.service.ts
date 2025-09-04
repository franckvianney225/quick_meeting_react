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
import { EmailService } from '../email/email.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
    private qrCodeService: QrCodeService,
    private emailService: EmailService
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

  /**
    * Envoie un email de notification au créateur de la réunion 3h avant la fin prévue
    * @param meeting La réunion concernée
    * @param endDate La date de fin calculée
    */
  async sendMeetingExpirationNotification(meeting: Meeting, endDate: Date): Promise<void> {
    try {
      if (!meeting.createdBy?.email) {
        console.warn(`Aucun email trouvé pour le créateur de la réunion ${meeting.id}`);
        return;
      }

      const config = await this.emailService.getConfig();
      if (!config) {
        console.warn('Configuration email non trouvée, impossible d\'envoyer la notification');
        return;
      }

      const expirationTime = endDate.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .urgent { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>QuickMeeting</h1>
              <p>Expiration prochaine d'une réunion</p>
            </div>
            <div class="content">
              <h2>Rappel : Expiration de votre réunion</h2>
              <p><strong>Réunion :</strong> ${meeting.title}</p>
              <p><strong>Code unique :</strong> ${meeting.uniqueCode}</p>
              <p>Votre réunion se terminera automatiquement le :</p>
              <p class="urgent">${expirationTime}</p>
              <p>Cette réunion passera automatiquement au statut "terminée" à ce moment-là.</p>
              <p>Cordialement,<br>L'équipe QuickMeeting</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Rappel : Expiration de votre réunion

        Réunion : ${meeting.title}
        Code unique : ${meeting.uniqueCode}

        Votre réunion se terminera automatiquement le : ${expirationTime}

        Cette réunion passera automatiquement au statut "terminée" à ce moment-là.

        Cordialement,
        L'équipe QuickMeeting
      `;

      await this.emailService.sendEmail(
        config,
        meeting.createdBy.email,
        `Rappel : Expiration de votre réunion ${meeting.title}`,
        htmlContent,
        textContent
      );

      console.log(`Email de notification envoyé au créateur de la réunion ${meeting.id}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de notification pour la réunion ${meeting.id}:`, error);
    }
  }

  /**
    * Vérifie et met à jour le statut des réunions dont la date de fin est expirée
    * Si meetingEndDate est défini et que la date actuelle dépasse cette date,
    * OU que meetingEndDate n'est pas défini et que le lendemain de startDate est dépassé,
    * le statut passe automatiquement à 'completed'
    */
  async checkAndUpdateExpiredMeetings(): Promise<void> {
    const now = new Date();
    const meetingsToComplete = [];

    // 1. Trouver toutes les réunions actives avec une date de fin définie et expirée
    const expiredMeetingsWithEndDate = await this.meetingRepository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.createdBy', 'user')
      .where('meeting.status = :status', { status: 'active' })
      .andWhere('meeting.meeting_end_date IS NOT NULL')
      .andWhere('meeting.meeting_end_date <= :now', { now })
      .getMany();

    meetingsToComplete.push(...expiredMeetingsWithEndDate);

    // 2. Trouver toutes les réunions actives sans date de fin (meetingEndDate est null)
    const meetingsWithoutEndDate = await this.meetingRepository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.createdBy', 'user')
      .where('meeting.status = :status', { status: 'active' })
      .andWhere('meeting.meeting_end_date IS NULL')
      .getMany();

    // 3. Pour chaque réunion sans date de fin, calculer si le lendemain de startDate est dépassé
    for (const meeting of meetingsWithoutEndDate) {
      if (meeting.startDate) {
        // Calculer le lendemain de startDate à la même heure
        const calculatedEndDate = new Date(meeting.startDate);
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 1);

        if (calculatedEndDate <= now) {
          meetingsToComplete.push(meeting);
        }
      }
    }

    if (meetingsToComplete.length === 0) {
      return;
    }

    // Mettre à jour le statut des réunions expirées
    await this.meetingRepository
      .createQueryBuilder()
      .update(Meeting)
      .set({ status: 'completed' })
      .whereInIds(meetingsToComplete.map(m => m.id))
      .execute();

    console.log(`${meetingsToComplete.length} réunion(s) ont été marquées comme 'completed' suite à l'expiration de leur date de fin`);
  }
}