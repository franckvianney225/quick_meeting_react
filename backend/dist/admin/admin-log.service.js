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
exports.AdminLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_log_entity_1 = require("./admin-log.entity");
let AdminLogService = class AdminLogService {
    constructor(adminLogRepository) {
        this.adminLogRepository = adminLogRepository;
    }
    async logAction(logData) {
        const log = this.adminLogRepository.create({
            userId: logData.userId,
            userEmail: logData.userEmail,
            action: logData.action,
            resourceType: logData.resourceType,
            resourceId: logData.resourceId,
            details: logData.details || {},
            ipAddress: logData.ipAddress,
            timestamp: new Date(),
        });
        await this.adminLogRepository.save(log);
    }
    async getLogs(page = 1, limit = 50, filters) {
        const skip = (page - 1) * limit;
        const query = this.adminLogRepository
            .createQueryBuilder('log')
            .orderBy('log.timestamp', 'DESC')
            .skip(skip)
            .take(limit);
        if (filters) {
            if (filters.userId) {
                query.andWhere('log.userId = :userId', { userId: filters.userId });
            }
            if (filters.action) {
                query.andWhere('log.action = :action', { action: filters.action });
            }
            if (filters.resourceType) {
                query.andWhere('log.resourceType = :resourceType', { resourceType: filters.resourceType });
            }
            if (filters.startDate) {
                query.andWhere('log.timestamp >= :startDate', { startDate: filters.startDate });
            }
            if (filters.endDate) {
                query.andWhere('log.timestamp <= :endDate', { endDate: filters.endDate });
            }
        }
        const [logs, total] = await query.getManyAndCount();
        return { logs, total };
    }
    async getRecentActions(userId, limit = 10) {
        const query = this.adminLogRepository
            .createQueryBuilder('log')
            .orderBy('log.timestamp', 'DESC')
            .take(limit);
        if (userId) {
            query.where('log.userId = :userId', { userId });
        }
        return query.getMany();
    }
};
exports.AdminLogService = AdminLogService;
exports.AdminLogService = AdminLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_log_entity_1.AdminLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminLogService);
//# sourceMappingURL=admin-log.service.js.map