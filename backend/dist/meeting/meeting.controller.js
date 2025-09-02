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
exports.MeetingController = void 0;
const common_1 = require("@nestjs/common");
const meeting_service_1 = require("./meeting.service");
const pdf_service_1 = require("../pdf/pdf.service");
const email_service_1 = require("../email/email.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MeetingController = class MeetingController {
    constructor(service, pdfService, emailService) {
        this.service = service;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    async findAll(req) {
        const userId = req.user?.id;
        if (req.user?.role === 'admin') {
            return this.service.findAll();
        }
        return this.service.findAll(userId);
    }
    async findAllAdmin(req) {
        console.log('=== ADMIN ACCESS CHECK ===');
        console.log('User role:', req.user?.role);
        console.log('User:', req.user);
        if (!req.user?.role || !['admin', 'administrator', 'Admin'].includes(req.user.role)) {
            console.log('Access denied for role:', req.user?.role);
            throw new common_1.HttpException('Accès réservé aux administrateurs', common_1.HttpStatus.FORBIDDEN);
        }
        console.log('Access granted for admin');
        return this.service.findAll();
    }
    async findOne(id, req) {
        const meeting = await this.service.findOne(id);
        if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
            throw new common_1.HttpException('Accès non autorisé', common_1.HttpStatus.FORBIDDEN);
        }
        return meeting;
    }
    async create(meetingData, req) {
        const normalizedData = {
            ...meetingData,
            startDate: meetingData.start_date || meetingData.startDate
        };
        const userId = req.user?.id;
        return this.service.create(normalizedData, userId);
    }
    async update(id, meetingData, req) {
        try {
            const meeting = await this.service.findOne(id);
            if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
                throw new common_1.HttpException('Accès non autorisé', common_1.HttpStatus.FORBIDDEN);
            }
            console.log(`Updating meeting ${id} with data:`, meetingData);
            return await this.service.update(id, meetingData);
        }
        catch (err) {
            console.error('Erreur dans le contrôleur:', err);
            throw new common_1.HttpException(err.message || 'Erreur lors de la mise à jour', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(id, req) {
        try {
            const meeting = await this.service.findOne(id);
            if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
                throw new common_1.HttpException('Accès non autorisé', common_1.HttpStatus.FORBIDDEN);
            }
            const participants = await this.service.getMeetingParticipants(id);
            if (participants.length > 0) {
                throw new common_1.HttpException('OUPPS VOUS NE POUVEZ PAS SUPPRIMER UNE REUNION AVEC DES PARTICIPANTS DEJA ENREGISTRES', common_1.HttpStatus.CONFLICT);
            }
            return this.service.remove(id);
        }
        catch (err) {
            if (err.message.includes('OUPPS VOUS NE POUVEZ PAS SUPPRIMER')) {
                throw new common_1.HttpException(err.message, common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException(err.message || 'Erreur lors de la suppression', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async handleParticipantRegistration(code, participantData) {
        try {
            const result = await this.service.registerParticipant(code, participantData);
            return { success: result };
        }
        catch (err) {
            throw new common_1.HttpException(err.message || "Erreur lors de l'enregistrement", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getMeetingParticipants(id, req) {
        try {
            const meeting = await this.service.findOne(id);
            if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
                throw new common_1.HttpException('Accès non autorisé', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.service.getMeetingParticipants(id);
        }
        catch (err) {
            throw new common_1.HttpException(err.message || "Erreur lors de la récupération des participants", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateQRCode(id, data) {
        try {
            const meeting = await this.service.findOne(id);
            return this.pdfService.generateMeetingQRPDF(data.url, meeting.title, data.qrConfig);
        }
        catch (err) {
            throw new common_1.HttpException(err.message || 'Erreur lors de la génération du QR code', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getMeetingStatus(code) {
        try {
            return await this.service.getMeetingStatusByCode(code);
        }
        catch (err) {
            throw new common_1.HttpException(err.message || 'Erreur lors de la vérification du statut', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async validateMeetingAccess(meetingId, code) {
        try {
            const meetingIdNum = parseInt(meetingId, 10);
            if (isNaN(meetingIdNum)) {
                throw new Error('ID de réunion invalide');
            }
            return await this.service.validateMeetingIdAndCode(meetingIdNum, code);
        }
        catch (err) {
            throw new common_1.HttpException(err.message || 'Erreur lors de la validation', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendEmailsToParticipants(id, body, req) {
        try {
            const meeting = await this.service.findOne(id);
            if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
                throw new common_1.HttpException('Accès non autorisé', common_1.HttpStatus.FORBIDDEN);
            }
            const participants = await this.service.getMeetingParticipants(id);
            let targetParticipants = participants;
            if (body.selectedParticipants && body.selectedParticipants.length > 0) {
                targetParticipants = participants.filter(p => body.selectedParticipants.includes(p.id));
            }
            const emails = targetParticipants
                .filter(p => p.email && p.email.includes('@'))
                .map(p => p.email);
            if (emails.length === 0) {
                throw new common_1.HttpException('Aucun email valide trouvé pour les participants', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.emailService.sendParticipantsEmail(emails, body.subject, body.message);
            return result;
        }
        catch (err) {
            throw new common_1.HttpException(err.message || "Erreur lors de l'envoi des emails", common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.MeetingController = MeetingController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':code/participants'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "handleParticipantRegistration", null);
__decorate([
    (0, common_1.Get)(':id/participants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "getMeetingParticipants", null);
__decorate([
    (0, common_1.Post)(':id/qrcode'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "generateQRCode", null);
__decorate([
    (0, common_1.Get)('status/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "getMeetingStatus", null);
__decorate([
    (0, common_1.Get)('validate/:meetingId/:code'),
    __param(0, (0, common_1.Param)('meetingId')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "validateMeetingAccess", null);
__decorate([
    (0, common_1.Post)(':id/send-emails'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingController.prototype, "sendEmailsToParticipants", null);
exports.MeetingController = MeetingController = __decorate([
    (0, common_1.Controller)('meetings'),
    __metadata("design:paramtypes", [meeting_service_1.MeetingService,
        pdf_service_1.PdfService,
        email_service_1.EmailService])
], MeetingController);
//# sourceMappingURL=meeting.controller.js.map