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
exports.ParticipantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const participant_entity_1 = require("./participant.entity");
const meeting_service_1 = require("../meeting/meeting.service");
let ParticipantService = class ParticipantService {
    constructor(participantRepository, meetingService) {
        this.participantRepository = participantRepository;
        this.meetingService = meetingService;
    }
    async create(uniqueCode, participantData) {
        const meeting = await this.meetingService.findOneByCode(uniqueCode);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        const participant = this.participantRepository.create({
            ...participantData,
            meeting,
            submittedAt: new Date()
        });
        return this.participantRepository.save(participant);
    }
    async findAllByMeeting(meetingCode) {
        const meeting = await this.meetingService.findOneByCode(meetingCode);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        return this.participantRepository.find({
            where: { meeting: { id: meeting.id } },
            order: { createdAt: 'ASC' }
        });
    }
    async findByEmail(email) {
        return this.participantRepository.find({
            where: { email },
            relations: ['meeting'],
            order: { createdAt: 'DESC' }
        });
    }
};
exports.ParticipantService = ParticipantService;
exports.ParticipantService = ParticipantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(participant_entity_1.Participant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        meeting_service_1.MeetingService])
], ParticipantService);
//# sourceMappingURL=participant.service.js.map