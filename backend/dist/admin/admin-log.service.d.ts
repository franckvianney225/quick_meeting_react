import { Repository } from 'typeorm';
import { AdminLog } from './admin-log.entity';
export interface AdminLogData {
    userId: number;
    userEmail: string;
    action: string;
    resourceType: string;
    resourceId?: number;
    details?: Record<string, unknown>;
    ipAddress?: string;
}
export declare class AdminLogService {
    private adminLogRepository;
    constructor(adminLogRepository: Repository<AdminLog>);
    logAction(logData: AdminLogData): Promise<void>;
    getLogs(page?: number, limit?: number, filters?: {
        userId?: number;
        action?: string;
        resourceType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        logs: AdminLog[];
        total: number;
    }>;
    getRecentActions(userId?: number, limit?: number): Promise<AdminLog[]>;
}
