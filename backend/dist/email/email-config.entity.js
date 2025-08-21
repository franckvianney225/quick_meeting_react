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
exports.EmailConfig = void 0;
const typeorm_1 = require("typeorm");
let EmailConfig = class EmailConfig {
};
exports.EmailConfig = EmailConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmailConfig.prototype, "server", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EmailConfig.prototype, "port", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmailConfig.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmailConfig.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmailConfig.prototype, "encryption", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_email' }),
    __metadata("design:type", String)
], EmailConfig.prototype, "fromEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_name' }),
    __metadata("design:type", String)
], EmailConfig.prototype, "fromName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EmailConfig.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_retries', nullable: true }),
    __metadata("design:type", Number)
], EmailConfig.prototype, "maxRetries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmailConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmailConfig.prototype, "updatedAt", void 0);
exports.EmailConfig = EmailConfig = __decorate([
    (0, typeorm_1.Entity)('email_config')
], EmailConfig);
//# sourceMappingURL=email-config.entity.js.map