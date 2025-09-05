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
exports.AdminSecurityController = exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
let SecurityController = class SecurityController {
    blockGet() {
        throw new Error('GET method not allowed for /login');
    }
    blockPost() {
        throw new Error('POST method not allowed for /login - use /auth/login');
    }
    blockPut() {
        throw new Error('PUT method not allowed for /login');
    }
    blockDelete() {
        throw new Error('DELETE method not allowed for /login');
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "blockGet", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "blockPost", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "blockPut", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "blockDelete", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('login'),
    (0, common_2.UseGuards)(throttler_1.ThrottlerGuard)
], SecurityController);
let AdminSecurityController = class AdminSecurityController {
    blockGet() {
        throw new Error('GET method not allowed for /admin - use /admin/system/status');
    }
    blockPost() {
        throw new Error('POST method not allowed for /admin');
    }
    blockPut() {
        throw new Error('PUT method not allowed for /admin');
    }
    blockDelete() {
        throw new Error('DELETE method not allowed for /admin');
    }
};
exports.AdminSecurityController = AdminSecurityController;
__decorate([
    (0, common_1.Get)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSecurityController.prototype, "blockGet", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSecurityController.prototype, "blockPost", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSecurityController.prototype, "blockPut", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_3.HttpCode)(common_1.HttpStatus.METHOD_NOT_ALLOWED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSecurityController.prototype, "blockDelete", null);
exports.AdminSecurityController = AdminSecurityController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_2.UseGuards)(throttler_1.ThrottlerGuard)
], AdminSecurityController);
//# sourceMappingURL=security.controller.js.map