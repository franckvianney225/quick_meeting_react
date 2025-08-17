import { Meeting } from '../meeting/meeting.entity';
export declare class Participant {
    id: number;
    name: string;
    email: string;
    phone: string;
    meeting: Meeting;
}
