import { SessionService } from './session.service';
import { AuthService } from '../auth/auth.service';
export declare class SessionController {
    private readonly sessionService;
    private readonly authService;
    constructor(sessionService: SessionService, authService: AuthService);
    getUserSessions(request: any): Promise<{
        id: number;
        deviceType: string;
        browser: string;
        os: string;
        ipAddress: string;
        location: string;
        isActive: boolean;
        lastActivity: Date;
        createdAt: Date;
        expiresAt: Date;
        isCurrent: boolean;
    }[]>;
    deactivateSession(request: any, sessionId: string): Promise<{
        message: string;
    }>;
    deactivateAllSessions(request: any): Promise<{
        message: string;
    }>;
    private isCurrentSession;
}
