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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const public_decorator_1 = require("./public.decorator");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            console.log('=== PUBLIC ENDPOINT - SKIPPING AUTH ===');
            return true;
        }
        const request = context.switchToHttp().getRequest();
        console.log('=== JWT GUARD ACTIVATED ===');
        console.log('Request URL:', request.url);
        console.log('Request Method:', request.method);
        const headers = request.headers;
        console.log('Authorization header present:', !!headers.authorization);
        if (headers.authorization) {
            console.log('Authorization header:', headers.authorization.substring(0, 50) + '...');
            if (!headers.authorization.startsWith('Bearer ')) {
                console.log('ERROR: Authorization header does not start with "Bearer "');
                throw new common_1.UnauthorizedException('Invalid authorization format');
            }
            const token = headers.authorization.substring(7);
            console.log('Token extracted:', token.substring(0, 20) + '...');
            console.log('Token length:', token.length);
        }
        try {
            const result = await super.canActivate(context);
            console.log('Guard canActivate result:', result);
            return result;
        }
        catch (error) {
            console.log('Guard canActivate ERROR:', error.message);
            console.log('Error stack:', error.stack);
            throw error;
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map