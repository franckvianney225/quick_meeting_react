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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = class UserController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        try {
            return await this.service.findAll();
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la récupération des utilisateurs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            return await this.service.findOne(id);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException('Erreur lors de la récupération de l\'utilisateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(userData) {
        try {
            return await this.service.create(userData);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('existe déjà')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.CONFLICT);
            }
            if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException('Erreur lors de la création de l\'utilisateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, userData) {
        try {
            return await this.service.update(id, userData);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof Error && error.message.includes('existe déjà')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.CONFLICT);
            }
            if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException('Erreur lors de la mise à jour de l\'utilisateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            await this.service.remove(id);
            return { message: 'Utilisateur supprimé avec succès' };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof Error && error.message.includes('OUPPS VOUS NE POUVEZ PAS SUPPRIMER')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException('Erreur lors de la suppression de l\'utilisateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async toggleStatus(id) {
        try {
            return await this.service.toggleStatus(id);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException('Erreur lors du changement de statut', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProfile(id) {
        try {
            return await this.service.findOne(id);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException('Erreur lors de la récupération du profil', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateProfile(id, profileData) {
        try {
            const allowedFields = ['name', 'email', 'phone', 'department', 'position', 'civility', 'avatar'];
            const filteredData = {};
            for (const key of allowedFields) {
                if (key in profileData && profileData[key] !== undefined) {
                    filteredData[key] = profileData[key];
                }
            }
            return await this.service.update(id, filteredData);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof Error && error.message.includes('existe déjà')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.CONFLICT);
            }
            if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException('Erreur lors de la mise à jour du profil', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadAvatar(id, file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('Aucun fichier fourni');
            }
            const avatarUrl = `/uploads/avatars/${file.filename}`;
            await this.service.update(id, { avatar: avatarUrl });
            return { avatarUrl };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('non trouvé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException('Erreur lors de l\'upload de l\'avatar', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async activateAccount(body) {
        try {
            const user = await this.service.activateAccount(body.token, body.password);
            return {
                message: 'Compte activé avec succès',
                user
            };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Token d\'activation invalide')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof Error && error.message.includes('token d\'activation a expiré')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            if (error instanceof Error && error.message.includes('déjà été activé')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Erreur lors de l\'activation du compte', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resendInvitation(id) {
        try {
            await this.service.resendInvitation(id);
            return { message: 'Invitation renvoyée avec succès' };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('en attente')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            if (error instanceof Error && error.message.includes('Erreur lors de l\'envoi de l\'email')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException('Erreur lors de l\'envoi de l\'invitation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(':id/profile'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)(':id/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/avatars',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `avatar-${uniqueSuffix}${ext}`);
            }
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return callback(new common_1.BadRequestException('Seules les images sont autorisées'), false);
            }
            callback(null, true);
        }
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('activate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "activateAccount", null);
__decorate([
    (0, common_1.Post)(':id/resend-invitation'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resendInvitation", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map