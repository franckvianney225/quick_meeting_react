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
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(authService) {
        console.log('=== JWT STRATEGY CONSTRUCTOR ===');
        console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'PRESENT' : 'MISSING');
        console.log('Using secret key:', process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        });
        this.authService = authService;
        console.log('=== JWT STRATEGY INITIALIZED ===');
    }
    async validate(payload) {
        console.log('=== JWT VALIDATION START ===');
        console.log('JWT Payload received:', payload);
        console.log('Token expiration:', payload.exp ? new Date(payload.exp * 1000) : 'No expiration');
        console.log('Current time:', new Date());
        try {
            const user = await this.authService.validateToken(payload);
            console.log('JWT VALIDATION SUCCESS: User found:', { id: user.id, email: user.email });
            console.log('=== JWT VALIDATION END ===');
            return {
                id: user.id,
                email: user.email,
                role: user.role
            };
        }
        catch (error) {
            console.log('JWT VALIDATION FAILED:', error.message);
            console.log('=== JWT VALIDATION END WITH ERROR ===');
            throw new common_1.UnauthorizedException();
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map