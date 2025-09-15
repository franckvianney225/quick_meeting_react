import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from './activity-log.entity';
import { User } from '../user/user.entity';
import { Meeting } from '../meeting/meeting.entity';
export interface ActivityLogFilters {
    meetingId?: number;
    userId?: number;
    type?: ActivityType;
    page?: number;
    limit?: number;
}
export declare class ActivityService {
    private readonly activityLogRepository;
    constructor(activityLogRepository: Repository<ActivityLog>);
    logActivity(type: ActivityType, description: string, meeting: Meeting, user?: User, metadata?: Record<string, any>): Promise<ActivityLog>;
    getMeetingActivities(filters: ActivityLogFilters): Promise<{
        logs: ActivityLog[];
        total: number;
    }>;
    createMeetingCreatedLog(meeting: Meeting, user: User): Promise<ActivityLog>;
    createMeetingUpdatedLog(meeting: Meeting, user: User, changes: Record<string, any>): Promise<ActivityLog>;
    createMeetingClosedLog(meeting: Meeting, user: User, automatic?: boolean): Promise<ActivityLog>;
    createMeetingReopenedLog(meeting: Meeting, user: User): Promise<ActivityLog>;
    createAttendanceListPrintedLog(meeting: Meeting, user: User): Promise<ActivityLog>;
    createQrCodePrintedLog(meeting: Meeting, user: User): Promise<ActivityLog>;
    createQrConfigUpdatedLog(meeting: Meeting, user: User, config: any): Promise<ActivityLog>;
}
