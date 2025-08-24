import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { PdfService } from '../pdf/pdf.service';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        role: string;
    };
}
interface ParticipantResponse {
    id: number;
    name: string;
    prenom: string;
    email: string;
    phone: string;
    fonction: string;
    organisation: string;
    signature: string;
    meetingId: number;
    registeredAt: string;
    submittedAt?: string;
    signatureDate?: string;
    location?: string;
}
export declare class MeetingController {
    private readonly service;
    private readonly pdfService;
    constructor(service: MeetingService, pdfService: PdfService);
    findAll(req: AuthenticatedRequest): Promise<Meeting[]>;
    findOne(id: number, req: AuthenticatedRequest): Promise<Meeting>;
    create(meetingData: {
        title: string;
        description?: string;
        status: 'active' | 'completed' | 'inactive';
        location: string;
        max_participants?: number;
        start_date?: string;
        startDate?: string;
    }, req: AuthenticatedRequest): Promise<Meeting>;
    update(id: number, meetingData: Partial<Meeting>, req: AuthenticatedRequest): Promise<Meeting>;
    remove(id: number, req: AuthenticatedRequest): Promise<void>;
    handleParticipantRegistration(code: string, participantData: {
        email: string;
        firstName: string;
        lastName: string;
        company?: string;
        position?: string;
        signature: string;
        agreedToTerms: boolean;
        location?: string;
    }): Promise<{
        success: boolean;
    }>;
    getMeetingParticipants(id: number, req: AuthenticatedRequest): Promise<ParticipantResponse[]>;
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
    getMeetingStatus(code: string): Promise<{
        status: string;
        title: string;
    }>;
}
export {};
