import { Injectable } from '@nestjs/common';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';

@Injectable()
export class PdfService {
  async generateMeetingQRPDF(url: string, title: string, qrConfig?: {
    color?: { dark?: string; light?: string };
    size?: number;
  }): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 105, 20, { align: 'center' });
    
    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: qrConfig?.size || 200,
      color: {
        dark: qrConfig?.color?.dark || '#000000',
        light: qrConfig?.color?.light || '#ffffff'
      }
    });
    
    // Add QR code to PDF
    doc.addImage(qrDataUrl, 'PNG', 55, 40, 100, 100);
    
    // Add URL
    doc.setFontSize(12);
    doc.text(url, 105, 150, { align: 'center' });
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}