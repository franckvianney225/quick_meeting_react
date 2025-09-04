import { MeetingService } from './meeting.service';
export declare class MeetingSchedulerService {
    private readonly meetingService;
    private readonly logger;
    constructor(meetingService: MeetingService);
    handleMeetingStatusChecks(): Promise<void>;
    sendExpirationReminders(): Promise<void>;
    handleFrequentMeetingStatusChecks(): Promise<void>;
}
