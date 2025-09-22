import { Meeting } from '../meeting/meeting.entity';
export declare class Participant {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    company: string;
    signature: string;
    meeting: Meeting;
    createdAt: Date;
    submittedAt: Date;
    signatureDate?: Date;
    location?: string;
    gender?: string;
}
