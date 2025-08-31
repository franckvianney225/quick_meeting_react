import { User } from '../user/user.entity';
export declare class Session {
    id: number;
    user: User;
    token: string;
    deviceType: string;
    browser: string;
    os: string;
    ipAddress: string;
    location: string;
    isActive: boolean;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    isExpired(): boolean;
    isValid(): boolean;
}
