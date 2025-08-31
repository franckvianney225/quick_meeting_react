import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { User } from '../user/user.entity';
interface DeviceInfo {
    deviceType?: string;
    browser?: string;
    os?: string;
    ipAddress?: string;
    location?: string;
}
export declare class SessionService {
    private sessionRepository;
    constructor(sessionRepository: Repository<Session>);
    createSession(user: User, token: string, deviceInfo: DeviceInfo): Promise<Session>;
    getUserSessions(userId: number): Promise<Session[]>;
    getActiveUserSessions(userId: number): Promise<Session[]>;
    getSessionByToken(token: string): Promise<Session | null>;
    updateSessionActivity(sessionId: number): Promise<void>;
    deactivateSession(sessionId: number): Promise<void>;
    deactivateAllUserSessions(userId: number, excludeSessionId?: number): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
    getSessionDeviceInfo(userAgent: string, ip: string): Promise<DeviceInfo>;
}
export {};
