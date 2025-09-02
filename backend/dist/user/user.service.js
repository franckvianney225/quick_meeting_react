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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const organization_service_1 = require("../organization/organization.service");
const email_service_1 = require("../email/email.service");
let UserService = class UserService {
    constructor(userRepository, organizationService, emailService) {
        this.userRepository = userRepository;
        this.organizationService = organizationService;
        this.emailService = emailService;
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async create(userData) {
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Un utilisateur avec cet email existe déjà');
        }
        const organizationSettings = await this.organizationService.getCurrentSettings();
        if (organizationSettings?.allowedEmailDomains?.length > 0) {
            const userEmail = userData.email.toLowerCase();
            const isDomainAllowed = organizationSettings.allowedEmailDomains.some(domain => {
                const domainPattern = domain.startsWith('@') ? domain.toLowerCase() : `@${domain.toLowerCase()}`;
                return userEmail.endsWith(domainPattern);
            });
            if (!isDomainAllowed) {
                throw new common_1.ForbiddenException('Le domaine email n\'est pas autorisé pour la création de compte');
            }
        }
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = this.userRepository.create({
            ...userData,
            password: '',
            status: 'pending',
            activation_token: activationToken,
            activation_token_expires: activationTokenExpires
        });
        const savedUser = await this.userRepository.save(user);
        try {
            await this.emailService.sendInvitationEmail(savedUser.email, savedUser.name, activationToken);
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
        }
        return savedUser;
    }
    async update(id, userData) {
        const user = await this.findOne(id);
        if (userData.email && userData.email !== user.email) {
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }
            const organizationSettings = await this.organizationService.getCurrentSettings();
            if (organizationSettings?.allowedEmailDomains?.length > 0) {
                const userEmail = userData.email.toLowerCase();
                const isDomainAllowed = organizationSettings.allowedEmailDomains.some(domain => {
                    const domainPattern = domain.startsWith('@') ? domain.toLowerCase() : `@${domain.toLowerCase()}`;
                    return userEmail.endsWith(domainPattern);
                });
                if (!isDomainAllowed) {
                    throw new common_1.ForbiddenException('Le domaine email n\'est pas autorisé pour la création de compte');
                }
            }
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        else {
            delete userData.password;
        }
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        if (user.status !== 'pending') {
            throw new Error('OUPPS VOUS NE POUVEZ PAS SUPPRIMER UN UTILISATEUR QUI A CREE DES REUNIONS');
        }
        await this.userRepository.remove(user);
    }
    async toggleStatus(id) {
        const user = await this.findOne(id);
        user.status = user.status === 'active' ? 'inactive' : 'active';
        return this.userRepository.save(user);
    }
    async updateLastLogin(id) {
        await this.userRepository.update(id, {
            last_login: new Date()
        });
    }
    async activateAccount(token, password) {
        const user = await this.userRepository.findOne({
            where: { activation_token: token }
        });
        if (!user) {
            throw new common_1.NotFoundException('Token d\'activation invalide');
        }
        if (user.activation_token_expires && user.activation_token_expires < new Date()) {
            throw new common_1.ForbiddenException('Le token d\'activation a expiré');
        }
        if (user.status !== 'pending') {
            throw new common_1.ForbiddenException('Ce compte a déjà été activé');
        }
        user.password = await bcrypt.hash(password, 10);
        user.status = 'active';
        user.activation_token = null;
        user.activation_token_expires = null;
        return this.userRepository.save(user);
    }
    async resendInvitation(userId) {
        const user = await this.findOne(userId);
        if (user.status !== 'pending') {
            throw new common_1.ForbiddenException('Seuls les comptes en attente peuvent recevoir une nouvelle invitation');
        }
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.activation_token = activationToken;
        user.activation_token_expires = activationTokenExpires;
        await this.userRepository.save(user);
        try {
            await this.emailService.sendInvitationEmail(user.email, user.name, activationToken);
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email');
        }
    }
    async generateResetToken(userId) {
        const user = await this.findOne(userId);
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        user.reset_token = resetToken;
        user.reset_token_expires = resetTokenExpires;
        await this.userRepository.save(user);
        return resetToken;
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { reset_token: token }
        });
        if (!user) {
            return { success: false, message: 'Token de réinitialisation invalide' };
        }
        if (user.reset_token_expires && user.reset_token_expires < new Date()) {
            return { success: false, message: 'Le token de réinitialisation a expiré' };
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.reset_token = null;
        user.reset_token_expires = null;
        await this.userRepository.save(user);
        return { success: true, message: 'Mot de passe réinitialisé avec succès' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.findOne(userId);
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return { success: false, message: 'Le mot de passe actuel est incorrect' };
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return { success: false, message: 'Le nouveau mot de passe doit être différent de l\'ancien' };
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
        return { success: true, message: 'Mot de passe mis à jour avec succès' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        organization_service_1.OrganizationService,
        email_service_1.EmailService])
], UserService);
//# sourceMappingURL=user.service.js.map