import { Participant } from '../participant/participant.entity';
export declare class Meeting {
    id: number;
    uniqueCode: string;
    title: string;
    startDate: Date;
    start_date?: string;
    description: string;
    status: 'active' | 'completed' | 'inactive';
    location: string;
    maxParticipants: number;
    qrCode: string;
    createdAt: Date;
    updatedAt: Date;
    participants: Participant[];
}
