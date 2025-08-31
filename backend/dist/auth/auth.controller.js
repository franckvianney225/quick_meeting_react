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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const user_service_1 = require("../user/user.service");
const email_service_1 = require("../email/email.service");
let AuthController = class AuthController {
    constructor(authService, userService, emailService) {
        this.authService = authService;
        this.userService = userService;
        this.emailService = emailService;
    }
    async login(loginDto, req) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        return this.authService.login(user, req);
    }
    async getProfile(req) {
        const user = req.user;
        console.log('=== PROFILE ENDPOINT ===');
        console.log('User from request:', user);
        console.log('User name:', user?.name);
        console.log('User civility:', user?.civility);
        console.log('========================');
        return user;
    }
    async forgotPassword(forgotPasswordDto) {
        try {
            const user = await this.userService.findByEmail(forgotPasswordDto.email);
            if (!user) {
                return {
                    success: false,
                    message: 'Desole, cet email nest pas enregistre dans notre systeme.'
                };
            }
            if (user.status !== 'active') {
                return {
                    success: false,
                    message: 'Votre compte nest pas encore active. Veuillez verifier vos emails pour le lien dactivation.'
                };
            }
            const resetToken = await this.userService.generateResetToken(user.id);
            await this.emailService.sendPasswordResetEmail(user.email, resetToken);
            return {
                success: true,
                message: 'Un lien de reinitialisation a ete envoye a votre adresse email.'
            };
        }
        catch (error) {
            console.error('Erreur lors de la demande de reinitialisation:', error);
            return {
                success: false,
                message: 'Une erreur est survenue lors de lenvoi du lien de reinitialisation.'
            };
        }
    }
    async changePassword(req, changePasswordDto) {
        try {
            const user = req.user;
            const result = await this.userService.changePassword(user.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
            if (!result.success) {
                throw new common_1.BadRequestException(result.message);
            }
            return { message: result.message };
        }
        catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            throw new common_1.BadRequestException(error instanceof common_1.BadRequestException
                ? error.message
                : 'Erreur lors du changement de mot de passe');
        }
    }
    async resetPassword(resetPasswordDto) {
        try {
            const result = await this.userService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
            if (!result.success) {
                throw new common_1.BadRequestException(result.message);
            }
            return { message: 'Mot de passe reinitialise avec succes' };
        }
        catch (error) {
            console.error('Erreur lors de la reinitialisation du mot de passe:', error);
            throw new common_1.BadRequestException(error instanceof common_1.BadRequestException
                ? error.message
                : 'Erreur lors de la reinitialisation du mot de passe');
        }
    }
    async adminResetPassword(adminResetPasswordDto) {
        try {
            const user = await this.userService.findByEmail(adminResetPasswordDto.email);
            if (!user) {
                throw new common_1.BadRequestException('Utilisateur non trouvé');
            }
            if (user.status !== 'active') {
                throw new common_1.BadRequestException('Le compte de l\'utilisateur n\'est pas actif');
            }
            const resetToken = await this.userService.generateResetToken(user.id);
            await this.emailService.sendPasswordResetEmail(user.email, resetToken);
            return {
                success: true,
                message: `Email de réinitialisation envoyé avec succès à ${user.email}`
            };
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de réinitialisation par admin:', error);
            throw new common_1.BadRequestException(error instanceof common_1.BadRequestException
                ? error.message
                : 'Erreur lors de l\'envoi de l\'email de réinitialisation');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Put)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('admin/reset-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminResetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        email_service_1.EmailService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map