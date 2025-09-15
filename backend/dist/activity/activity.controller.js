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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_service_1 = require("./activity.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const activity_log_entity_1 = require("./activity-log.entity");
let ActivityController = class ActivityController {
    constructor(activityService, activityLogRepository) {
        this.activityService = activityService;
        this.activityLogRepository = activityLogRepository;
    }
    async getMeetingActivities(meetingId, page, limit, type) {
        const filters = {
            meetingId: parseInt(meetingId),
            page: page ? parseInt(page.toString()) : 1,
            limit: limit ? parseInt(limit.toString()) : 20,
            type: type,
        };
        return this.activityService.getMeetingActivities(filters);
    }
    async createActivityLog(meetingId, body, req) {
        try {
            const meeting = { id: parseInt(meetingId), title: 'Réunion' };
            const log = this.activityLogRepository.create({
                type: body.type,
                description: body.description,
                meeting: meeting,
                meetingId: parseInt(meetingId)
            });
            await this.activityLogRepository.save(log);
            return { success: true };
        }
        catch (error) {
            console.error('Erreur lors de la création du log:', error);
            throw new common_1.HttpException('Erreur lors de la création du log d\'activité', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)('meeting/:meetingId'),
    __param(0, (0, common_1.Param)('meetingId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getMeetingActivities", null);
__decorate([
    (0, common_1.Post)('meeting/:meetingId/log'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('meetingId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "createActivityLog", null);
exports.ActivityController = ActivityController = __decorate([
    (0, common_1.Controller)('activity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, typeorm_1.InjectRepository)(activity_log_entity_1.ActivityLog)),
    __metadata("design:paramtypes", [activity_service_1.ActivityService,
        typeorm_2.Repository])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map