import { ConfigService } from '@nestjs/config';
export declare class QrCodeService {
    private configService;
    constructor(configService: ConfigService);
    generateMeetingQRCode(meetingCode: string): Promise<string>;
    generateQRCode(content: string, options?: {
        color?: {
            dark?: string;
            light?: string;
        };
        width?: number;
    }): Promise<Buffer>;
}
