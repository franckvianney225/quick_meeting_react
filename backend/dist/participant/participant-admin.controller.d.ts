import { ParticipantService } from './participant.service';
import { AdminLogService } from '../admin/admin-log.service';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        role: string;
    };
}
export declare class ParticipantAdminController {
    private readonly participantService;
    private readonly adminLogService;
    constructor(participantService: ParticipantService, adminLogService: AdminLogService);
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
export {};
