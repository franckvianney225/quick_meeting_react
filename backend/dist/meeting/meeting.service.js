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
let MeetingService = class MeetingService {
    constructor(meetingRepository, participantRepository, qrCodeService) {
        this.meetingRepository = meetingRepository;
        this.participantRepository = participantRepository;
        this.qrCodeService = qrCodeService;
    }
    async create(meetingData) {
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
        const meeting = this.meetingRepository.create({
            title: meetingData.title,
            description: meetingData.description,
            status: meetingData.status,
            location: meetingData.location,
            maxParticipants: meetingData.max_participants,
            startDate: startDate,
            uniqueCode: uniqueCode
        });
        meeting.qrCode = await this.qrCodeService.generateMeetingQRCode(meeting.uniqueCode);
        return await this.meetingRepository.save(meeting);
    }
    async findAll() {
        return this.meetingRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id) {
        const meeting = await this.meetingRepository.findOne({ where: { id } });
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
            registeredAt: p.meeting?.createdAt.toISOString() || new Date().toISOString()
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
            phone: '',
            fonction: participantData.position || '',
            organisation: participantData.company || '',
            signature: participantData.signature,
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
};
exports.MeetingService = MeetingService;
exports.MeetingService = MeetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __param(1, (0, typeorm_1.InjectRepository)(participant_entity_1.Participant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        qrcode_service_1.QrCodeService])
], MeetingService);
//# sourceMappingURL=meeting.service.js.map