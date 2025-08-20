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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const organization_service_1 = require("./organization.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let OrganizationController = class OrganizationController {
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    async getSettings() {
        return this.organizationService.getCurrentSettings();
    }
    async saveSettings(organizationData) {
        return this.organizationService.saveSettings(organizationData);
    }
    async updateSettings(organizationData) {
        return this.organizationService.saveSettings(organizationData);
    }
    async deleteSettings() {
        return this.organizationService.deleteSettings();
    }
    async clearAllSettings() {
        return this.organizationService.clearAllSettings();
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "saveSettings", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteSettings", null);
__decorate([
    (0, common_1.Delete)('clear-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "clearAllSettings", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, common_1.Controller)('organization'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map