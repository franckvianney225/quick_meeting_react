"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const jspdf_1 = require("jspdf");
const QRCode = require("qrcode");
let PdfService = class PdfService {
    async generateMeetingQRPDF(url, title, qrConfig) {
        const doc = new jspdf_1.jsPDF();
        doc.setFontSize(20);
        doc.text(title, 105, 20, { align: 'center' });
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: qrConfig?.size || 200,
            color: {
                dark: qrConfig?.color?.dark || '#000000',
                light: qrConfig?.color?.light || '#ffffff'
            }
        });
        doc.addImage(qrDataUrl, 'PNG', 55, 40, 100, 100);
        doc.setFontSize(12);
        doc.text(url, 105, 150, { align: 'center' });
        return Buffer.from(doc.output('arraybuffer'));
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map