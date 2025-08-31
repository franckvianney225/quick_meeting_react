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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("./session.entity");
let SessionService = class SessionService {
    constructor(sessionRepository) {
        this.sessionRepository = sessionRepository;
    }
    async createSession(user, token, deviceInfo) {
        const session = this.sessionRepository.create({
            user,
            token,
            deviceType: deviceInfo.deviceType || 'Unknown',
            browser: deviceInfo.browser || 'Unknown',
            os: deviceInfo.os || 'Unknown',
            ipAddress: deviceInfo.ipAddress,
            location: deviceInfo.location,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            lastActivity: new Date(),
        });
        return await this.sessionRepository.save(session);
    }
    async getUserSessions(userId) {
        return await this.sessionRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { lastActivity: 'DESC' },
        });
    }
    async getActiveUserSessions(userId) {
        return await this.sessionRepository.find({
            where: {
                user: { id: userId },
                isActive: true
            },
            relations: ['user'],
            order: { lastActivity: 'DESC' },
        });
    }
    async getSessionByToken(token) {
        return await this.sessionRepository.findOne({
            where: { token },
            relations: ['user'],
        });
    }
    async updateSessionActivity(sessionId) {
        await this.sessionRepository.update(sessionId, {
            lastActivity: new Date(),
        });
    }
    async deactivateSession(sessionId) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
            relations: ['user'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.sessionRepository.update(sessionId, {
            isActive: false,
            updatedAt: new Date(),
        });
    }
    async deactivateAllUserSessions(userId, excludeSessionId) {
        const queryBuilder = this.sessionRepository
            .createQueryBuilder()
            .update(session_entity_1.Session)
            .set({
            isActive: false,
            updatedAt: new Date(),
        })
            .where('user.id = :userId', { userId })
            .andWhere('isActive = :isActive', { isActive: true });
        if (excludeSessionId) {
            queryBuilder.andWhere('id != :excludeSessionId', { excludeSessionId });
        }
        await queryBuilder.execute();
    }
    async cleanupExpiredSessions() {
        await this.sessionRepository
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :now', { now: new Date() })
            .orWhere('isActive = false')
            .execute();
    }
    async getSessionDeviceInfo(userAgent, ip) {
        const deviceInfo = {
            deviceType: 'Desktop',
            browser: 'Unknown',
            os: 'Unknown',
            ipAddress: ip,
            location: null,
        };
        if (userAgent) {
            if (userAgent.includes('Chrome'))
                deviceInfo.browser = 'Chrome';
            else if (userAgent.includes('Firefox'))
                deviceInfo.browser = 'Firefox';
            else if (userAgent.includes('Safari'))
                deviceInfo.browser = 'Safari';
            else if (userAgent.includes('Edge'))
                deviceInfo.browser = 'Edge';
            if (userAgent.includes('Windows'))
                deviceInfo.os = 'Windows';
            else if (userAgent.includes('Mac'))
                deviceInfo.os = 'macOS';
            else if (userAgent.includes('Linux'))
                deviceInfo.os = 'Linux';
            else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
                deviceInfo.os = 'iOS';
                deviceInfo.deviceType = 'Mobile';
            }
            else if (userAgent.includes('Android')) {
                deviceInfo.os = 'Android';
                deviceInfo.deviceType = 'Mobile';
            }
        }
        return deviceInfo;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SessionService);
//# sourceMappingURL=session.service.js.map