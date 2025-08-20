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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("./organization.entity");
let OrganizationService = class OrganizationService {
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
    }
    async getCurrentSettings() {
        const settings = await this.organizationRepository.find();
        return settings.length > 0 ? settings[0] : null;
    }
    async saveSettings(settingsData) {
        const existingSettings = await this.getCurrentSettings();
        if (existingSettings) {
            Object.assign(existingSettings, settingsData);
            return this.organizationRepository.save(existingSettings);
        }
        else {
            const organization = this.organizationRepository.create(settingsData);
            return this.organizationRepository.save(organization);
        }
    }
    async deleteSettings() {
        const existingSettings = await this.getCurrentSettings();
        if (existingSettings) {
            await this.organizationRepository.remove(existingSettings);
        }
    }
    async clearAllSettings() {
        const allSettings = await this.organizationRepository.find();
        await this.organizationRepository.remove(allSettings);
    }
    async initializeDefaultSettings() {
        const existingSettings = await this.getCurrentSettings();
        if (existingSettings) {
            return existingSettings;
        }
        const defaultSettings = {
            name: 'Ministère Ivoirien',
            address: 'Abidjan, Côte d\'Ivoire',
            phone: '+225 20 21 22 23',
            email: 'contact@ministere.gov.ci',
            website: 'https://www.ministere.gov.ci',
            logo: null,
            allowedEmailDomains: ['ministere.gov.ci', 'gouv.ci']
        };
        return this.saveSettings(defaultSettings);
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.OrganizationSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map