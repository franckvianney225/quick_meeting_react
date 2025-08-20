import 'reflect-metadata';
import { Meeting } from '../meeting/meeting.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
    avatar: string | null;
    phone: string | null;
    department: string | null;
    position: string | null;
    last_login: Date | null;
    entreprise_id: number | null;
    created_at: Date;
    updated_at: Date;
    meetings: Meeting[];
}
