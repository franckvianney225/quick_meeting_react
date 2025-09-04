"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_entity_1 = require("./meeting.entity");
const participant_entity_1 = require("../participant/participant.entity");
const qrcode_service_1 = require("../qrcode/qrcode.service");
const email_service_1 = require("../email/email.service");
let MeetingService = class MeetingService {
    constructor(meetingRepository, participantRepository, qrCodeService, emailService) {
        this.meetingRepository = meetingRepository;
        this.participantRepository = participantRepository;
        this.qrCodeService = qrCodeService;
        this.emailService = emailService;
    }
    async create(meetingData, userId) {
        const dateString = meetingData.startDate ||
            (meetingData.start_date ? new Date(meetingData.start_date).toISOString() : undefined);
        if (!dateString) {
            throw new Error('Start date is required');
        }
        const startDate = new Date(dateString);
        if (isNaN(startDate.getTime())) {
            throw new Error('Invalid date format');
        }
        if (isNaN(startDate.getTime())) {
            throw new Error('Format de date invalide');
        }
        const generateUniqueCode = () => {
            return Math.random().toString(36).substring(2, 10).toUpperCase();
        };
        let uniqueCode = generateUniqueCode();
        while (await this.findOneByCode(uniqueCode)) {
            uniqueCode = generateUniqueCode();
        }
        const meetingStartDate = meetingData.meetingstartdate ? new Date(meetingData.meetingstartdate) : undefined;
        const meetingEndDate = meetingData.meetingenddate ? new Date(meetingData.meetingenddate) : undefined;
        const meeting = this.meetingRepository.create({
            title: meetingData.title.toUpperCase(),
            description: meetingData.description,
            status: 'active',
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
        meeting.qrCode = await this.qrCodeService.generateMeetingQRCode(meeting.uniqueCode);
        return await this.meetingRepository.save(meeting);
    }
    async findAll(userId) {
        const where = userId ? { createdById: userId } : {};
        return this.meetingRepository.find({
            where,
            order: { createdAt: 'DESC' },
            relations: ['createdBy']
        });
    }
    async findOne(id) {
        const meeting = await this.meetingRepository.findOne({
            where: { id },
            relations: ['createdBy']
        });
        if (!meeting) {
            throw new common_1.NotFoundException(`Meeting with ID ${id} not found`);
        }
        return meeting;
    }
    async findOneByCode(uniqueCode) {
        return this.meetingRepository.findOne({ where: { uniqueCode } });
    }
    async update(id, meetingData) {
        const meeting = await this.findOne(id);
        if (meetingData.start_date && isNaN(new Date(meetingData.start_date).getTime())) {
            throw new Error('Format de date invalide');
        }
        if (meetingData.uniqueCode) {
            delete meetingData.uniqueCode;
        }
        if (meetingData.start_date) {
            meetingData.startDate = new Date(meetingData.start_date);
            delete meetingData.start_date;
        }
        if (meetingData.meetingstartdate) {
            meetingData.meetingStartDate = new Date(meetingData.meetingstartdate);
            delete meetingData.meetingstartdate;
        }
        if (meetingData.meetingenddate) {
            meetingData.meetingEndDate = new Date(meetingData.meetingenddate);
            delete meetingData.meetingenddate;
        }
        if (meetingData.title) {
            meetingData.title = meetingData.title.toUpperCase();
        }
        Object.assign(meeting, meetingData);
        try {
            return await this.meetingRepository.save(meeting);
        }
        catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
            throw new Error(err.message || 'Erreur lors de la mise à jour');
        }
    }
    async remove(id) {
        const meeting = await this.findOne(id);
        const participants = await this.participantRepository.find({
            where: { meeting: { id } }
        });
        if (participants.length > 0) {
            throw new Error('OUPPS VOUS NE POUVEZ PAS SUPPRIMER UNE REUNION AVEC DES PARTICIPANTS DEJA ENREGISTRES');
        }
        await this.meetingRepository.remove(meeting);
    }
    async getMeetingParticipants(meetingId) {
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
    async registerParticipant(meetingCode, participantData) {
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
    async generateQRCode(meetingId, url, config) {
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
        }
        catch (err) {
            console.error('Erreur génération QR code:', err);
            throw new Error('Failed to generate QR code');
        }
    }
    async getMeetingStatusByCode(code) {
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
    async validateMeetingIdAndCode(meetingId, code) {
        const meeting = await this.meetingRepository.findOne({
            where: { uniqueCode: code.toUpperCase() }
        });
        if (!meeting) {
            throw new Error('Réunion non trouvée avec ce code');
        }
        if (meeting.id !== meetingId) {
            throw new Error('Incohérence entre l\'identifiant et le code de la réunion');
        }
        return {
            status: meeting.status,
            title: meeting.title
        };
    }
    async sendMeetingExpirationNotification(meeting, endDate) {
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
            await this.emailService.sendEmail(config, meeting.createdBy.email, `Rappel : Expiration de votre réunion ${meeting.title}`, htmlContent, textContent);
            console.log(`Email de notification envoyé au créateur de la réunion ${meeting.id}`);
        }
        catch (error) {
            console.error(`Erreur lors de l'envoi de l'email de notification pour la réunion ${meeting.id}:`, error);
        }
    }
    async checkAndUpdateExpiredMeetings() {
        const now = new Date();
        const meetingsToComplete = [];
        const expiredMeetingsWithEndDate = await this.meetingRepository
            .createQueryBuilder('meeting')
            .leftJoinAndSelect('meeting.createdBy', 'user')
            .where('meeting.status = :status', { status: 'active' })
            .andWhere('meeting.meeting_end_date IS NOT NULL')
            .andWhere('meeting.meeting_end_date <= :now', { now })
            .getMany();
        meetingsToComplete.push(...expiredMeetingsWithEndDate);
        const meetingsWithoutEndDate = await this.meetingRepository
            .createQueryBuilder('meeting')
            .leftJoinAndSelect('meeting.createdBy', 'user')
            .where('meeting.status = :status', { status: 'active' })
            .andWhere('meeting.meeting_end_date IS NULL')
            .getMany();
        for (const meeting of meetingsWithoutEndDate) {
            if (meeting.startDate) {
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
        await this.meetingRepository
            .createQueryBuilder()
            .update(meeting_entity_1.Meeting)
            .set({ status: 'completed' })
            .whereInIds(meetingsToComplete.map(m => m.id))
            .execute();
        console.log(`${meetingsToComplete.length} réunion(s) ont été marquées comme 'completed' suite à l'expiration de leur date de fin`);
    }
};
exports.MeetingService = MeetingService;
exports.MeetingService = MeetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __param(1, (0, typeorm_1.InjectRepository)(participant_entity_1.Participant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        qrcode_service_1.QrCodeService,
        email_service_1.EmailService])
], MeetingService);
//# sourceMappingURL=meeting.service.js.map