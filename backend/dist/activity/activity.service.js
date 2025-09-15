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
    async createLog(log) {
        return this.activityLogRepository.save(log);
    }
    async findAll(filters = {}) {
        const { userId, userEmail, activityType, startDate, endDate, search, success, page = 1, limit = 20, } = filters;
        const skip = (page - 1) * limit;
        const query = this.activityLogRepository.createQueryBuilder('log');
        if (userId) {
            query.andWhere('log.userId = :userId', { userId });
        }
        if (userEmail) {
            query.andWhere('log.userEmail ILIKE :userEmail', { userEmail: `%${userEmail}%` });
        }
        if (activityType) {
            query.andWhere('log.activityType = :activityType', { activityType });
        }
        if (startDate && endDate) {
            query.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            query.andWhere('log.timestamp >= :startDate', { startDate });
        }
        else if (endDate) {
            query.andWhere('log.timestamp <= :endDate', { endDate });
        }
        if (search) {
            query.andWhere('(log.description ILIKE :search OR log.userName ILIKE :search OR log.userEmail ILIKE :search)', {
                search: `%${search}%`,
            });
        }
        if (success !== undefined) {
            query.andWhere('log.success = :success', { success });
        }
        const [logs, total] = await query
            .orderBy('log.timestamp', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { logs, total };
    }
    async findById(id) {
        return this.activityLogRepository.findOne({ where: { id } });
    }
    async findByUserId(userId, limit = 50) {
        return this.activityLogRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
    async getStats(startDate, endDate) {
        const query = this.activityLogRepository.createQueryBuilder('log');
        if (startDate && endDate) {
            query.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        const logs = await query.getMany();
        const totalLogs = logs.length;
        const successfulLogs = logs.filter(log => log.success).length;
        const failedLogs = totalLogs - successfulLogs;
        const loginCount = logs.filter(log => log.activityType === activity_log_entity_1.ActivityType.LOGIN).length;
        const logoutCount = logs.filter(log => log.activityType === activity_log_entity_1.ActivityType.LOGOUT).length;
        const meetingActivities = logs.filter(log => log.activityType === activity_log_entity_1.ActivityType.MEETING_CREATED ||
            log.activityType === activity_log_entity_1.ActivityType.MEETING_UPDATED ||
            log.activityType === activity_log_entity_1.ActivityType.MEETING_DELETED).length;
        const participantActivities = logs.filter(log => log.activityType === activity_log_entity_1.ActivityType.PARTICIPANT_REGISTERED).length;
        const recentActivity = await this.activityLogRepository.find({
            order: { timestamp: 'DESC' },
            take: 10,
        });
        return {
            totalLogs,
            successfulLogs,
            failedLogs,
            loginCount,
            logoutCount,
            meetingActivities,
            participantActivities,
            recentActivity,
        };
    }
    async cleanupOldLogs(days = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await this.activityLogRepository.delete({
            timestamp: (0, typeorm_2.LessThan)(cutoffDate),
        });
        return result.affected || 0;
    }
    async getFailedLoginAttempts(email, hours = 24) {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - hours);
        return this.activityLogRepository.count({
            where: {
                userEmail: email,
                activityType: activity_log_entity_1.ActivityType.LOGIN_FAILED,
                timestamp: (0, typeorm_2.MoreThan)(cutoffDate),
            },
        });
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_log_entity_1.ActivityLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActivityService);
//# sourceMappingURL=activity.service.js.map