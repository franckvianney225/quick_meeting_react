import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
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
import { Participant } from '../participant/participant.entity';
import { QrCodeService } from '../qrcode/qrcode.service';
export declare class MeetingService {
    private meetingRepository;
    private participantRepository;
    private qrCodeService;
    constructor(meetingRepository: Repository<Meeting>, participantRepository: Repository<Participant>, qrCodeService: QrCodeService);
    create(meetingData: {
        title: string;
        description?: string;
        status: 'active' | 'completed' | 'inactive';
        location: string;
        max_participants?: number;
        start_date?: string;
        startDate?: string;
    }, userId?: number): Promise<Meeting>;
    findAll(userId?: number): Promise<Meeting[]>;
    findOne(id: number): Promise<Meeting>;
    findOneByCode(uniqueCode: string): Promise<Meeting | null>;
    update(id: number, meetingData: Partial<Meeting>): Promise<Meeting>;
    remove(id: number): Promise<void>;
    getMeetingParticipants(meetingId: number): Promise<ParticipantResponse[]>;
    registerParticipant(meetingCode: string, participantData: {
        email: string;
        firstName: string;
        lastName: string;
        company?: string;
        position?: string;
        signature: string;
        agreedToTerms: boolean;
        location?: string;
    }): Promise<boolean>;
    generateQRCode(meetingId: number, url: string, config?: {
        color?: {
            dark?: string;
            light?: string;
        };
        size?: number;
    }): Promise<Buffer>;
    getMeetingStatusByCode(code: string): Promise<{
        status: string;
        title: string;
    }>;
}
export {};
