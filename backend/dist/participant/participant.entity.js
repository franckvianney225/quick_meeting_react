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
exports.Participant = void 0;
const typeorm_1 = require("typeorm");
const meeting_entity_1 = require("../meeting/meeting.entity");
let Participant = class Participant {
    constructor() {
        this.id = 0;
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.position = '';
        this.company = '';
        this.signature = '';
    }
};
exports.Participant = Participant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Participant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], Participant.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], Participant.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Participant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Participant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'position' }),
    __metadata("design:type", String)
], Participant.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company' }),
    __metadata("design:type", String)
], Participant.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Participant.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => meeting_entity_1.Meeting, meeting => meeting.participants),
    (0, typeorm_1.JoinColumn)({ name: 'meeting_id' }),
    __metadata("design:type", meeting_entity_1.Meeting)
], Participant.prototype, "meeting", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Participant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'submitted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Participant.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Participant.prototype, "signatureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Participant.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], Participant.prototype, "gender", void 0);
exports.Participant = Participant = __decorate([
    (0, typeorm_1.Entity)()
], Participant);
//# sourceMappingURL=participant.entity.js.map