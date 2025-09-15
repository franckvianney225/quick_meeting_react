import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from './activity-log.entity';
export interface ActivityLogFilters {
    userId?: number;
    userEmail?: string;
    activityType?: ActivityType;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    success?: boolean;
    page?: number;
    limit?: number;
}
export interface ActivityStats {
    totalLogs: number;
    successfulLogs: number;
    failedLogs: number;
    loginCount: number;
    logoutCount: number;
    meetingActivities: number;
    participantActivities: number;
    recentActivity: ActivityLog[];
}
export declare class ActivityService {
    private readonly activityLogRepository;
    constructor(activityLogRepository: Repository<ActivityLog>);
    createLog(log: ActivityLog): Promise<ActivityLog>;
    findAll(filters?: ActivityLogFilters): Promise<{
        logs: ActivityLog[];
        total: number;
    }>;
    findById(id: number): Promise<ActivityLog>;
    findByUserId(userId: number, limit?: number): Promise<ActivityLog[]>;
    getStats(startDate?: Date, endDate?: Date): Promise<ActivityStats>;
    cleanupOldLogs(days?: number): Promise<number>;
    getFailedLoginAttempts(email: string, hours?: number): Promise<number>;
}
