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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MeetingController = class MeetingController {
    constructor(service, pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }
    async findAll(req) {
        const userId = req.user?.id;
        return this.service.findAll(userId);
    }
    async findOne(id, req) {
        const meeting = await this.service.findOne(id);
        if (meeting.createdById !== req.user?.id) {
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
            if (meeting.createdById !== req.user?.id) {
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
        const meeting = await this.service.findOne(id);
        if (meeting.createdById !== req.user?.id) {
            throw new common_1.HttpException('Accès non autorisé', common_1.HttpStatus.FORBIDDEN);
        }
        return this.service.remove(id);
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
            if (meeting.createdById !== req.user?.id) {
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
exports.MeetingController = MeetingController = __decorate([
    (0, common_1.Controller)('meetings'),
    __metadata("design:paramtypes", [meeting_service_1.MeetingService,
        pdf_service_1.PdfService])
], MeetingController);
//# sourceMappingURL=meeting.controller.js.map