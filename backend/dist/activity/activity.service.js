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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_log_entity_1 = require("./activity-log.entity");
let ActivityService = class ActivityService {
    constructor(activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }
    async logActivity(type, description, meeting, user, metadata) {
        const log = this.activityLogRepository.create({
            type,
            description,
            meeting,
            user,
            metadata,
        });
        return this.activityLogRepository.save(log);
    }
    async getMeetingActivities(filters) {
        const { meetingId, userId, type, page = 1, limit = 20 } = filters;
        const query = this.activityLogRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .leftJoinAndSelect('log.meeting', 'meeting')
            .where('log.meetingId = :meetingId', { meetingId });
        if (userId) {
            query.andWhere('log.userId = :userId', { userId });
        }
        if (type) {
            query.andWhere('log.type = :type', { type });
        }
        const [logs, total] = await query
            .orderBy('log.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { logs, total };
    }
    async createMeetingCreatedLog(meeting, user) {
        return this.logActivity(activity_log_entity_1.ActivityType.MEETING_CREATED, `${user.name} a créé une nouvelle réunion "${meeting.title}"`, meeting, user, {
            meetingTitle: meeting.title,
            startDate: meeting.start_date || meeting.startDate,
            location: meeting.location,
        });
    }
    async createMeetingUpdatedLog(meeting, user, changes) {
        const changeDescriptions = Object.entries(changes)
            .map(([field, value]) => {
            if (field === 'title')
                return `le titre en "${value}"`;
            if (field === 'location')
                return `la localisation en "${value}"`;
            if (field === 'description')
                return `la description`;
            if (field === 'max_participants')
                return `le nombre maximum de participants en ${value}`;
            if (field === 'qrConfig')
                return `la configuration du QR code`;
            return field;
        })
            .join(', ');
        return this.logActivity(activity_log_entity_1.ActivityType.MEETING_UPDATED, `${user.name} a modifié ${changeDescriptions} pour la réunion "${meeting.title}"`, meeting, user, { changes });
    }
    async createMeetingClosedLog(meeting, user, automatic = false) {
        const type = automatic ? activity_log_entity_1.ActivityType.MEETING_AUTO_CLOSED : activity_log_entity_1.ActivityType.MEETING_CLOSED;
        const description = automatic
            ? `La réunion "${meeting.title}" a été clôturée automatiquement après 24h`
            : `${user.name} a clôturé la réunion "${meeting.title}"`;
        return this.logActivity(type, description, meeting, automatic ? undefined : user, { automatic });
    }
    async createMeetingReopenedLog(meeting, user) {
        return this.logActivity(activity_log_entity_1.ActivityType.MEETING_REOPENED, `${user.name} a rouvert la réunion "${meeting.title}"`, meeting, user);
    }
    async createAttendanceListPrintedLog(meeting, user) {
        return this.logActivity(activity_log_entity_1.ActivityType.ATTENDANCE_LIST_PRINTED, `${user.name} a imprimé la liste de présence pour la réunion "${meeting.title}"`, meeting, user);
    }
    async createQrCodePrintedLog(meeting, user) {
        return this.logActivity(activity_log_entity_1.ActivityType.QR_CODE_PRINTED, `${user.name} a imprimé le code QR pour la réunion "${meeting.title}"`, meeting, user);
    }
    async createQrConfigUpdatedLog(meeting, user, config) {
        return this.logActivity(activity_log_entity_1.ActivityType.QR_CONFIG_UPDATED, `${user.name} a modifié les couleurs du code QR pour la réunion "${meeting.title}"`, meeting, user, { qrConfig: config });
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_log_entity_1.ActivityLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActivityService);
//# sourceMappingURL=activity.service.js.map