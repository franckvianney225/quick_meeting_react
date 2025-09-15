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
exports.ActivityLog = exports.ActivityType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const meeting_entity_1 = require("../meeting/meeting.entity");
var ActivityType;
(function (ActivityType) {
    ActivityType["MEETING_CREATED"] = "meeting_created";
    ActivityType["MEETING_UPDATED"] = "meeting_updated";
    ActivityType["MEETING_CLOSED"] = "meeting_closed";
    ActivityType["MEETING_REOPENED"] = "meeting_reopened";
    ActivityType["MEETING_AUTO_CLOSED"] = "meeting_auto_closed";
    ActivityType["ATTENDANCE_LIST_PRINTED"] = "attendance_list_printed";
    ActivityType["QR_CODE_PRINTED"] = "qr_code_printed";
    ActivityType["QR_CONFIG_UPDATED"] = "qr_config_updated";
    ActivityType["PARTICIPANT_ADDED"] = "participant_added";
    ActivityType["PARTICIPANT_REMOVED"] = "participant_removed";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
let ActivityLog = class ActivityLog {
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ActivityType,
    }),
    __metadata("design:type", String)
], ActivityLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ActivityLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ActivityLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ActivityLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ActivityLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => meeting_entity_1.Meeting, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'meetingId' }),
    __metadata("design:type", meeting_entity_1.Meeting)
], ActivityLog.prototype, "meeting", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ActivityLog.prototype, "meetingId", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, typeorm_1.Entity)('activity_logs')
], ActivityLog);
//# sourceMappingURL=activity-log.entity.js.map