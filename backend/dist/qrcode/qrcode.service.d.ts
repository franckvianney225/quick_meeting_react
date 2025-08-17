import { ConfigService } from '@nestjs/config';
export declare class QrCodeService {
    private configService;
    constructor(configService: ConfigService);
    generateMeetingQRCode(meetingCode: string): Promise<string>;
}
