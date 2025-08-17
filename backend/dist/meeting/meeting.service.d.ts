import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import { QrCodeService } from '../qrcode/qrcode.service';
export declare class MeetingService {
    private meetingRepository;
    private qrCodeService;
    constructor(meetingRepository: Repository<Meeting>, qrCodeService: QrCodeService);
    create(meetingData: {
        title: string;
        description?: string;
        status: 'active' | 'completed' | 'inactive';
        location: string;
        max_participants?: number;
        start_date?: string;
        startDate?: string;
    }): Promise<Meeting>;
    findAll(): Promise<Meeting[]>;
    findOne(id: number): Promise<Meeting>;
    findOneByCode(uniqueCode: string): Promise<Meeting | null>;
    update(id: number, meetingData: Partial<Meeting>): Promise<Meeting>;
    remove(id: number): Promise<void>;
    generateQRCode(meetingId: number, url: string, config?: {
        color?: {
            dark?: string;
            light?: string;
        };
        size?: number;
    }): Promise<Buffer>;
}
