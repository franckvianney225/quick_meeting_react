import { Participant } from '../participant/participant.entity';
import { User } from '../user/user.entity';
export declare class Meeting {
    id: number;
    uniqueCode: string;
    title: string;
    startDate: Date;
    start_date?: string;
    meetingStartDate?: Date;
    meetingEndDate?: Date;
    description: string;
    status: 'active' | 'completed' | 'inactive';
    location: string;
    maxParticipants: number;
    qrCode: string;
    qrConfig: {
        backgroundColor?: string;
        foregroundColor?: string;
        size?: number;
        includeMargin?: boolean;
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
        includeText?: boolean;
        customText?: string;
        logoUrl?: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: User | null;
    createdById: number | null;
    participants: Participant[];
}
