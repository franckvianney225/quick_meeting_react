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
exports.ParticipantController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const participant_service_1 = require("./participant.service");
const create_participant_dto_1 = require("./dto/create-participant.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ParticipantController = class ParticipantController {
    constructor(service) {
        this.service = service;
    }
    async create(uniqueCode, participantData) {
        return this.service.create(uniqueCode, participantData);
    }
    async findAllByMeeting(uniqueCode) {
        return this.service.findAllByMeeting(uniqueCode);
    }
    async remove(id) {
        return this.service.remove(parseInt(id));
    }
};
exports.ParticipantController = ParticipantController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('uniqueCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_participant_dto_1.CreateParticipantDto]),
    __metadata("design:returntype", Promise)
], ParticipantController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('uniqueCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParticipantController.prototype, "findAllByMeeting", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParticipantController.prototype, "remove", null);
exports.ParticipantController = ParticipantController = __decorate([
    (0, common_1.Controller)('meetings/:uniqueCode/participants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], ParticipantController);
//# sourceMappingURL=participant.controller.js.map