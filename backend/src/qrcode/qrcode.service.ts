import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  constructor(private configService: ConfigService) {}

  async generateMeetingQRCode(meetingCode: string): Promise<string> {
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3001';
    const registrationUrl = `${baseUrl}/meetings/${meetingCode}/register`;
    
    try {
      return await QRCode.toDataURL(registrationUrl);
    } catch (err) {
      throw new Error('Failed to generate QR code');
    }
  }
}