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
const uuid_1 = require("uuid");
const qrcode_service_1 = require("../qrcode/qrcode.service");
let MeetingService = class MeetingService {
    constructor(meetingRepository, qrCodeService) {
        this.meetingRepository = meetingRepository;
        this.qrCodeService = qrCodeService;
    }
    async create(meetingData) {
        const meeting = this.meetingRepository.create({
            ...meetingData,
            uniqueCode: (0, uuid_1.v4)().substring(0, 8),
        });
        const savedMeeting = await this.meetingRepository.save(meeting);
        savedMeeting.qrCode = await this.qrCodeService.generateMeetingQRCode(savedMeeting.uniqueCode);
        return this.meetingRepository.save(savedMeeting);
    }
    async findAll() {
        return this.meetingRepository.find();
    }
    async findOneByCode(uniqueCode) {
        return this.meetingRepository.findOne({ where: { uniqueCode } });
    }
};
exports.MeetingService = MeetingService;
exports.MeetingService = MeetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        qrcode_service_1.QrCodeService])
], MeetingService);
