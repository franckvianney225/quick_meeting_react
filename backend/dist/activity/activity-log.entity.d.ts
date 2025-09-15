import { User } from '../user/user.entity';
interface DeviceInfo {
    deviceType?: string;
    browser?: string;
    os?: string;
    userAgent?: string;
    location?: string;
}
export declare enum ActivityType {
    LOGIN = "login",
    LOGOUT = "logout",
    LOGIN_FAILED = "login_failed",
    PASSWORD_CHANGE = "password_change",
    PROFILE_UPDATE = "profile_update",
    MEETING_CREATED = "meeting_created",
    MEETING_UPDATED = "meeting_updated",
    MEETING_DELETED = "meeting_deleted",
    PARTICIPANT_REGISTERED = "participant_registered",
    SETTINGS_UPDATED = "settings_updated"
}
export declare class ActivityLog {
    id: number;
    user: User;
    userId: number;
    userEmail: string;
    userName: string;
    activityType: ActivityType;
    description: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    location?: string;
    timestamp: Date;
    success: boolean;
    errorMessage?: string;
    static createLoginSuccess(user: User, deviceInfo: DeviceInfo, ipAddress?: string): ActivityLog;
    static createLoginFailed(email: string, reason: string, deviceInfo: DeviceInfo, ipAddress?: string): ActivityLog;
    static createLogout(user: User, deviceInfo: DeviceInfo, ipAddress?: string): ActivityLog;
    static createPasswordChange(user: User, deviceInfo: DeviceInfo, ipAddress?: string): ActivityLog;
    static createMeetingActivity(user: User, activityType: ActivityType, meetingTitle: string, meetingId: number, deviceInfo: DeviceInfo): ActivityLog;
    static createParticipantActivity(user: User, activityType: ActivityType, participantName: string, meetingTitle: string, deviceInfo: DeviceInfo): ActivityLog;
    static createProfileUpdate(user: User, deviceInfo: DeviceInfo, changes: Record<string, unknown>): ActivityLog;
}
export {};
