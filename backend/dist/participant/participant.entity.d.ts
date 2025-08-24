import { Meeting } from '../meeting/meeting.entity';
export declare class Participant {
    id: number;
    name: string;
    prenom: string;
    email: string;
    phone: string;
    fonction: string;
    organisation: string;
    signature: string;
    meeting: Meeting;
    createdAt: Date;
    submittedAt: Date;
    signatureDate?: Date;
}
