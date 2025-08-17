import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  constructor(private configService: ConfigService) {}

  async generateMeetingQRCode(meetingCode: string): Promise<string> {
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3001';
    const registrationUrl = `${baseUrl}/meetings/${meetingCode}/register`;
    return QRCode.toDataURL(registrationUrl);
  }

  async generateQRCode(
    content: string,
    options?: {
      color?: {
        dark?: string;
        light?: string;
      };
      width?: number;
    }
  ): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(content, {
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#ffffff'
        },
        width: options?.width || 200,
        type: 'png'
      });
    } catch (err) {
      console.error('Erreur génération QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  }
}