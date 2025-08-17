import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { PdfService } from '../pdf/pdf.service';
export declare class MeetingController {
    private readonly service;
    private readonly pdfService;
    constructor(service: MeetingService, pdfService: PdfService);
    findAll(): Promise<Meeting[]>;
    findOne(id: number): Promise<Meeting>;
    create(meetingData: {
        title: string;
        description?: string;
        status: 'active' | 'completed' | 'inactive';
        location: string;
        max_participants?: number;
        start_date?: string;
        startDate?: string;
    }): Promise<Meeting>;
    update(id: number, meetingData: Partial<Meeting>): Promise<Meeting>;
    remove(id: number): Promise<void>;
    generateQRCode(id: number, data: {
        url: string;
        qrConfig?: {
            color?: {
                dark?: string;
                light?: string;
            };
            size?: number;
        };
    }): Promise<Buffer>;
}
