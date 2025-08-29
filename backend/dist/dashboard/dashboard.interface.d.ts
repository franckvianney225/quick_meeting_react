export interface RecentMeeting {
    id: number;
    title: string;
    startDate: string;
    status: string;
    participants_count?: number;
}
export interface MeetingStatusDistribution {
    active: number;
    completed: number;
    inactive: number;
}
export interface ParticipantStats {
    total: number;
    averagePerMeeting: number;
    maxInMeeting: number;
    minInMeeting: number;
}
export interface MonthlyStats {
    month: string;
    meetings: number;
    participants: number;
    averageParticipants: number;
}
export interface DashboardStats {
    totalMeetings: number;
    activeMeetings: number;
    completedMeetings: number;
    totalParticipants: number;
    averageParticipants: number;
    meetingStatusDistribution: MeetingStatusDistribution;
    participantStats: ParticipantStats;
    monthlyStats: MonthlyStats[];
    meetingsByMonth: {
        month: string;
        count: number;
    }[];
    participantsByMonth: {
        month: string;
        count: number;
    }[];
    statusDistribution: {
        status: string;
        count: number;
    }[];
    recentMeetings: RecentMeeting[];
    participationRate: number;
    maxParticipantsMeeting?: {
        title: string;
        count: number;
    };
    minParticipantsMeeting?: {
        title: string;
        count: number;
    };
}
