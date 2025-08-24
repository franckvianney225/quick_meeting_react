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
exports.ParticipantSearchController = void 0;
const common_1 = require("@nestjs/common");
const participant_service_1 = require("./participant.service");
let ParticipantSearchController = class ParticipantSearchController {
    constructor(participantService) {
        this.participantService = participantService;
    }
    async findByEmail(email) {
        if (!email) {
            throw new Error('Email parameter is required');
        }
        return this.participantService.findByEmail(email);
    }
    async checkRegistration(email, meetingCode) {
        if (!email || !meetingCode) {
            throw new Error('Email and meetingCode parameters are required');
        }
        const isRegistered = await this.participantService.isAlreadyRegistered(email, meetingCode);
        if (isRegistered) {
            const meeting = await this.participantService['meetingService'].findOneByCode(meetingCode);
            if (!meeting) {
                throw new Error('Réunion non trouvée');
            }
            const existingParticipant = await this.participantService['participantRepository'].findOne({
                where: {
                    email,
                    meeting: { id: meeting.id }
                },
                relations: ['meeting']
            });
            if (existingParticipant) {
                return {
                    isRegistered: true,
                    participant: {
                        email: existingParticipant.email,
                        name: existingParticipant.name,
                        prenom: existingParticipant.prenom,
                        phone: existingParticipant.phone,
                        fonction: existingParticipant.fonction,
                        organisation: existingParticipant.organisation,
                        signature: existingParticipant.signature
                    }
                };
            }
        }
        return { isRegistered: false };
    }
};
exports.ParticipantSearchController = ParticipantSearchController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParticipantSearchController.prototype, "findByEmail", null);
__decorate([
    (0, common_1.Get)('check-registration'),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('meetingCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParticipantSearchController.prototype, "checkRegistration", null);
exports.ParticipantSearchController = ParticipantSearchController = __decorate([
    (0, common_1.Controller)('participants'),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], ParticipantSearchController);
//# sourceMappingURL=participant-search.controller.js.map