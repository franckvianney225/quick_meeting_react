import { Repository } from 'typeorm';
import { Meeting } from '../meeting/meeting.entity';
import { Participant } from '../participant/participant.entity';
import { DashboardStats } from './dashboard.interface';
export declare class DashboardService {
    private readonly meetingRepository;
    private readonly participantRepository;
    constructor(meetingRepository: Repository<Meeting>, participantRepository: Repository<Participant>);
    getDashboardStats(): Promise<DashboardStats>;
    private calculateMonthlyStats;
    private calculateMeetingsByMonth;
    private calculateParticipantsByMonth;
    private getDefaultStats;
}
