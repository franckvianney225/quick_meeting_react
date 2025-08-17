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
exports.QrCodeService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = require("qrcode");
const config_1 = require("@nestjs/config");
let QrCodeService = class QrCodeService {
    constructor(configService) {
        this.configService = configService;
    }
    async generateMeetingQRCode(meetingCode) {
        const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3001';
        const registrationUrl = `${baseUrl}/meetings/${meetingCode}/register`;
        return QRCode.toDataURL(registrationUrl);
    }
    async generateQRCode(content, options) {
        try {
            return await QRCode.toBuffer(content, {
                color: {
                    dark: options?.color?.dark || '#000000',
                    light: options?.color?.light || '#ffffff'
                },
                width: options?.width || 200,
                type: 'png'
            });
        }
        catch (err) {
            console.error('Erreur génération QR code:', err);
            throw new Error('Failed to generate QR code');
        }
    }
};
exports.QrCodeService = QrCodeService;
exports.QrCodeService = QrCodeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QrCodeService);
//# sourceMappingURL=qrcode.service.js.map