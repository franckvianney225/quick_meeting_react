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
var ActivityLog_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = exports.ActivityType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
var ActivityType;
(function (ActivityType) {
    ActivityType["LOGIN"] = "login";
    ActivityType["LOGOUT"] = "logout";
    ActivityType["LOGIN_FAILED"] = "login_failed";
    ActivityType["PASSWORD_CHANGE"] = "password_change";
    ActivityType["PROFILE_UPDATE"] = "profile_update";
    ActivityType["MEETING_CREATED"] = "meeting_created";
    ActivityType["MEETING_UPDATED"] = "meeting_updated";
    ActivityType["MEETING_DELETED"] = "meeting_deleted";
    ActivityType["PARTICIPANT_REGISTERED"] = "participant_registered";
    ActivityType["SETTINGS_UPDATED"] = "settings_updated";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
let ActivityLog = ActivityLog_1 = class ActivityLog {
    static createLoginSuccess(user, deviceInfo, ipAddress) {
        const log = new ActivityLog_1();
        log.user = user;
        log.userId = user.id;
        log.userEmail = user.email;
        log.userName = user.name;
        log.activityType = ActivityType.LOGIN;
        log.description = `Connexion réussie`;
        log.details = {
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.ipAddress = ipAddress;
        log.userAgent = deviceInfo.userAgent;
        log.deviceType = deviceInfo.deviceType;
        log.browser = deviceInfo.browser;
        log.os = deviceInfo.os;
        log.location = deviceInfo.location;
        log.success = true;
        return log;
    }
    static createLoginFailed(email, reason, deviceInfo, ipAddress) {
        const log = new ActivityLog_1();
        log.userEmail = email;
        log.activityType = ActivityType.LOGIN_FAILED;
        log.description = `Tentative de connexion échouée: ${reason}`;
        log.details = {
            attemptEmail: email,
            reason: reason,
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.ipAddress = ipAddress;
        log.userAgent = deviceInfo.userAgent;
        log.deviceType = deviceInfo.deviceType;
        log.browser = deviceInfo.browser;
        log.os = deviceInfo.os;
        log.location = deviceInfo.location;
        log.success = false;
        log.errorMessage = reason;
        return log;
    }
    static createLogout(user, deviceInfo, ipAddress) {
        const log = new ActivityLog_1();
        log.user = user;
        log.userId = user.id;
        log.userEmail = user.email;
        log.userName = user.name;
        log.activityType = ActivityType.LOGOUT;
        log.description = `Déconnexion`;
        log.details = {
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.ipAddress = ipAddress;
        log.userAgent = deviceInfo.userAgent;
        log.deviceType = deviceInfo.deviceType;
        log.browser = deviceInfo.browser;
        log.os = deviceInfo.os;
        log.location = deviceInfo.location;
        log.success = true;
        return log;
    }
    static createPasswordChange(user, deviceInfo, ipAddress) {
        const log = new ActivityLog_1();
        log.user = user;
        log.userId = user.id;
        log.userEmail = user.email;
        log.userName = user.name;
        log.activityType = ActivityType.PASSWORD_CHANGE;
        log.description = `Changement de mot de passe`;
        log.details = {
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.ipAddress = ipAddress;
        log.userAgent = deviceInfo.userAgent;
        log.deviceType = deviceInfo.deviceType;
        log.browser = deviceInfo.browser;
        log.os = deviceInfo.os;
        log.location = deviceInfo.location;
        log.success = true;
        return log;
    }
    static createMeetingActivity(user, activityType, meetingTitle, meetingId, deviceInfo) {
        const log = new ActivityLog_1();
        log.user = user;
        log.userId = user.id;
        log.userEmail = user.email;
        log.userName = user.name;
        log.activityType = activityType;
        log.description = `${activityType === ActivityType.MEETING_CREATED ? 'Création' : activityType === ActivityType.MEETING_UPDATED ? 'Modification' : 'Suppression'} de la réunion: ${meetingTitle}`;
        log.details = {
            meetingId: meetingId,
            meetingTitle: meetingTitle,
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.success = true;
        return log;
    }
    static createParticipantActivity(user, activityType, participantName, meetingTitle, deviceInfo) {
        const log = new ActivityLog_1();
        log.user = user;
        log.userId = user.id;
        log.userEmail = user.email;
        log.userName = user.name;
        log.activityType = activityType;
        log.description = `Inscription du participant ${participantName} à la réunion: ${meetingTitle}`;
        log.details = {
            participantName: participantName,
            meetingTitle: meetingTitle,
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.success = true;
        return log;
    }
    static createProfileUpdate(user, deviceInfo, changes) {
        const log = new ActivityLog_1();
        log.user = user;
        log.userId = user.id;
        log.userEmail = user.email;
        log.userName = user.name;
        log.activityType = ActivityType.PROFILE_UPDATE;
        log.description = `Mise à jour du profil`;
        log.details = {
            changes: changes,
            device: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os
        };
        log.success = true;
        return log;
    }
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], ActivityLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ActivityLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActivityLog.prototype, "userEmail", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActivityLog.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ActivityType,
    }),
    __metadata("design:type", String)
], ActivityLog.prototype, "activityType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActivityLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "deviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "browser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "os", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ActivityLog.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ActivityLog.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "errorMessage", void 0);
exports.ActivityLog = ActivityLog = ActivityLog_1 = __decorate([
    (0, typeorm_1.Entity)('activity_logs')
], ActivityLog);
//# sourceMappingURL=activity-log.entity.js.map