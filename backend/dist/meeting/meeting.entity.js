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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
const typeorm_1 = require("typeorm");
const participant_entity_1 = require("../participant/participant.entity");
const user_entity_1 = require("../user/user.entity");
let Meeting = class Meeting {
};
exports.Meeting = Meeting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Meeting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, name: 'unique_code' }),
    __metadata("design:type", String)
], Meeting.prototype, "uniqueCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Meeting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], Meeting.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date_legacy', nullable: true, select: false }),
    __metadata("design:type", String)
], Meeting.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meeting_start_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Meeting.prototype, "meetingStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meeting_end_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Meeting.prototype, "meetingEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Meeting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Meeting.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Meeting.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_participants', nullable: true }),
    __metadata("design:type", Number)
], Meeting.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code', nullable: true }),
    __metadata("design:type", String)
], Meeting.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_config', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "qrConfig", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Meeting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Meeting.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.meetings, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Meeting.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", Number)
], Meeting.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => participant_entity_1.Participant, participant => participant.meeting),
    __metadata("design:type", Array)
], Meeting.prototype, "participants", void 0);
exports.Meeting = Meeting = __decorate([
    (0, typeorm_1.Entity)()
], Meeting);
//# sourceMappingURL=meeting.entity.js.map