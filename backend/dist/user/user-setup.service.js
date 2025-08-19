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
exports.UserSetupService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
let UserSetupService = class UserSetupService {
    constructor(userService) {
        this.userService = userService;
    }
    async onApplicationBootstrap() {
        await this.createDefaultAdmin();
    }
    async createDefaultAdmin() {
        try {
            console.log('🔍 Vérification de l\'existence de l\'administrateur par défaut...');
            const adminEmail = 'admin@ministere.gov';
            const existingAdmin = await this.userService.findByEmail(adminEmail);
            if (existingAdmin) {
                console.log('✅ Administrateur par défaut existe déjà');
                return;
            }
            const defaultAdmin = {
                name: 'Administrateur Système',
                email: adminEmail,
                password: 'admin123',
                role: 'Admin',
                status: 'active'
            };
            await this.userService.create(defaultAdmin);
            console.log('✅ Administrateur par défaut créé avec succès');
            console.log('📧 Email: admin@ministere.gov');
            console.log('🔑 Mot de passe: admin123');
            console.log('⚠️  IMPORTANT: Changez le mot de passe immédiatement après la première connexion!');
        }
        catch (error) {
            console.error('❌ Erreur lors de la création de l\'administrateur par défaut:', error.message);
        }
    }
};
exports.UserSetupService = UserSetupService;
exports.UserSetupService = UserSetupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserSetupService);
//# sourceMappingURL=user-setup.service.js.map