import { Repository } from 'typeorm';
import { ActivityService } from './activity.service';
import { ActivityLog } from './activity-log.entity';
import { Request } from 'express';
export declare class ActivityController {
    private readonly activityService;
    private readonly activityLogRepository;
    constructor(activityService: ActivityService, activityLogRepository: Repository<ActivityLog>);
    getMeetingActivities(meetingId: string, page?: number, limit?: number, type?: string): Promise<{
        logs: ActivityLog[];
        total: number;
    }>;
    createActivityLog(meetingId: string, body: {
        type: string;
        description: string;
    }, req: Request): Promise<{
        success: boolean;
    }>;
}
