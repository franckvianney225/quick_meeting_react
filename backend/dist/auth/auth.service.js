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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const organization_service_1 = require("../organization/organization.service");
const session_service_1 = require("../session/session.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userService, jwtService, organizationService, sessionService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.organizationService = organizationService;
        this.sessionService = sessionService;
    }
    async validateUser(email, password) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Votre compte est désactivé');
        }
        const organizationSettings = await this.organizationService.getCurrentSettings();
        console.log('=== DOMAIN VALIDATION DEBUG ===');
        console.log('Organization settings:', organizationSettings);
        console.log('User email:', email);
        if (organizationSettings && organizationSettings.allowedEmailDomains && organizationSettings.allowedEmailDomains.length > 0) {
            const userDomain = email.split('@')[1];
            console.log('User domain:', userDomain);
            console.log('Allowed domains:', organizationSettings.allowedEmailDomains);
            const isDomainAllowed = organizationSettings.allowedEmailDomains.some(allowedDomain => {
                const cleanDomain = allowedDomain.startsWith('@') ? allowedDomain.substring(1) : allowedDomain;
                return cleanDomain === userDomain;
            });
            console.log('Is domain allowed:', isDomainAllowed);
            if (!isDomainAllowed) {
                console.log('Domain not allowed, throwing error');
                throw new common_1.UnauthorizedException('Votre domaine email n\'est pas autorisé pour la connexion');
            }
            else {
                console.log('Domain is allowed, proceeding with login');
            }
        }
        else {
            console.log('No domain restrictions or no settings found');
        }
        const { password: _, ...result } = user;
        return result;
    }
    async login(user, request) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        };
        const token = this.jwtService.sign(payload);
        await this.userService.updateLastLogin(user.id);
        if (request) {
            try {
                const userAgent = Array.isArray(request.headers['user-agent'])
                    ? request.headers['user-agent'][0]
                    : request.headers['user-agent'] || '';
                const ipAddress = request.ip || request.connection?.remoteAddress;
                const deviceInfo = await this.sessionService.getSessionDeviceInfo(userAgent, ipAddress || '');
                await this.sessionService.createSession(user, token, deviceInfo);
            }
            catch (error) {
                console.error('Erreur lors de la création de la session:', error);
            }
        }
        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                lastLogin: new Date().toISOString(),
                avatar: user.avatar,
                civility: user.civility
            }
        };
    }
    async validateToken(payload) {
        const user = await this.userService.findOne(payload.sub);
        if (!user || user.status !== 'active') {
            throw new common_1.UnauthorizedException('Utilisateur invalide ou désactivé');
        }
        return user;
    }
    isUserAdmin(user) {
        const adminRoles = ['admin', 'administrator', 'Admin', 'Administrator'];
        return adminRoles.includes(user.role);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        organization_service_1.OrganizationService,
        session_service_1.SessionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map