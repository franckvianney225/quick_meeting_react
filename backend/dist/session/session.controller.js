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
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_service_1 = require("../auth/auth.service");
let SessionController = class SessionController {
    constructor(sessionService, authService) {
        this.sessionService = sessionService;
        this.authService = authService;
    }
    async getUserSessions(request) {
        const userId = request.user.id;
        const sessions = await this.sessionService.getUserSessions(userId);
        return sessions.map(session => ({
            id: session.id,
            deviceType: session.deviceType,
            browser: session.browser,
            os: session.os,
            ipAddress: session.ipAddress,
            location: session.location,
            isActive: session.isActive,
            lastActivity: session.lastActivity,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            isCurrent: this.isCurrentSession(request, session),
        }));
    }
    async deactivateSession(request, sessionId) {
        const userId = request.user.id;
        const session = await this.sessionService.getSessionByToken(request.headers.authorization?.replace('Bearer ', ''));
        if (!session || session.user.id !== userId) {
            throw new Error('Unauthorized');
        }
        await this.sessionService.deactivateSession(parseInt(sessionId));
        return { message: 'Session déconnectée avec succès' };
    }
    async deactivateAllSessions(request) {
        const userId = request.user.id;
        const currentSessionToken = request.headers.authorization?.replace('Bearer ', '');
        const currentSession = await this.sessionService.getSessionByToken(currentSessionToken);
        if (currentSession) {
            await this.sessionService.deactivateAllUserSessions(userId, currentSession.id);
        }
        else {
            await this.sessionService.deactivateAllUserSessions(userId);
        }
        return { message: 'Toutes les autres sessions ont été déconnectées' };
    }
    isCurrentSession(request, session) {
        const currentToken = request.headers.authorization?.replace('Bearer ', '');
        return session.token === currentToken;
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getUserSessions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deactivateSession", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deactivateAllSessions", null);
exports.SessionController = SessionController = __decorate([
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [session_service_1.SessionService,
        auth_service_1.AuthService])
], SessionController);
//# sourceMappingURL=session.controller.js.map