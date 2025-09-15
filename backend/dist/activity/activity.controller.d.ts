import { ActivityService, ActivityLogFilters, ActivityStats } from './activity.service';
import { ActivityLog } from './activity-log.entity';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    findAll(filters: ActivityLogFilters): Promise<{
        logs: ActivityLog[];
        total: number;
    }>;
    getStats(startDate?: string, endDate?: string): Promise<ActivityStats>;
    findByUserId(userId: number, limit?: number): Promise<ActivityLog[]>;
    getFailedLoginAttempts(email: string, hours?: number): Promise<{
        count: number;
    }>;
}
