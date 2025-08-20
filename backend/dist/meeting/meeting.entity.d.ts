import { Participant } from '../participant/participant.entity';
import { User } from '../user/user.entity';
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
    createdBy: User | null;
    createdById: number | null;
    participants: Participant[];
}
