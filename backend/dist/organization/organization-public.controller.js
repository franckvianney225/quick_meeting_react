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
exports.OrganizationPublicController = void 0;
const common_1 = require("@nestjs/common");
const organization_service_1 = require("./organization.service");
const public_decorator_1 = require("../auth/public.decorator");
let OrganizationPublicController = class OrganizationPublicController {
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    async getOrganizationName() {
        const settings = await this.organizationService.getCurrentSettings();
        return { name: settings?.name || 'Ministère' };
    }
};
exports.OrganizationPublicController = OrganizationPublicController;
__decorate([
    (0, common_1.Get)('name'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationPublicController.prototype, "getOrganizationName", null);
exports.OrganizationPublicController = OrganizationPublicController = __decorate([
    (0, common_1.Controller)('organization/public'),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationPublicController);
//# sourceMappingURL=organization-public.controller.js.map