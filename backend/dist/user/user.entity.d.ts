import 'reflect-metadata';
import { Meeting } from '../meeting/meeting.entity';
import { Session } from '../session/session.entity';
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
    civility: string | null;
    last_login: Date | null;
    entreprise_id: number | null;
    created_at: Date;
    updated_at: Date;
    activation_token: string | null;
    activation_token_expires: Date | null;
    reset_token: string | null;
    reset_token_expires: Date | null;
    meetings: Meeting[];
    sessions: Session[];
}
