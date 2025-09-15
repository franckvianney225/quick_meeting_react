import { User } from '../user/user.entity';
import { Meeting } from '../meeting/meeting.entity';
export declare enum ActivityType {
    MEETING_CREATED = "meeting_created",
    MEETING_UPDATED = "meeting_updated",
    MEETING_CLOSED = "meeting_closed",
    MEETING_REOPENED = "meeting_reopened",
    MEETING_AUTO_CLOSED = "meeting_auto_closed",
    ATTENDANCE_LIST_PRINTED = "attendance_list_printed",
    QR_CODE_PRINTED = "qr_code_printed",
    QR_CONFIG_UPDATED = "qr_config_updated",
    PARTICIPANT_ADDED = "participant_added",
    PARTICIPANT_REMOVED = "participant_removed"
}
export declare class ActivityLog {
    id: number;
    type: ActivityType;
    description: string;
    metadata: Record<string, any>;
    createdAt: Date;
    user: User;
    userId: number;
    meeting: Meeting;
    meetingId: number;
}
