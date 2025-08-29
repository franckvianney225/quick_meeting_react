"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_entity_1 = require("../meeting/meeting.entity");
const participant_entity_1 = require("../participant/participant.entity");
let DashboardService = class DashboardService {
    constructor(meetingRepository, participantRepository) {
        this.meetingRepository = meetingRepository;
        this.participantRepository = participantRepository;
    }
    async getDashboardStats() {
        try {
            const meetings = await this.meetingRepository.find({
                relations: ['participants'],
                order: { startDate: 'DESC' },
            });
            const participants = await this.participantRepository.find();
            const totalMeetings = meetings.length;
            const totalParticipants = participants.length;
            const totalOrganizations = 1;
            const meetingStatusDistribution = {
                active: meetings.filter(m => m.status === 'active').length,
                completed: meetings.filter(m => m.status === 'completed').length,
                inactive: meetings.filter(m => m.status === 'inactive').length,
            };
            const participantCounts = meetings.map(m => m.participants?.length || 0);
            const participantStats = {
                total: totalParticipants,
                averagePerMeeting: totalMeetings > 0 ? participantCounts.reduce((a, b) => a + b, 0) / totalMeetings : 0,
                maxInMeeting: participantCounts.length > 0 ? Math.max(...participantCounts) : 0,
                minInMeeting: participantCounts.length > 0 ? Math.min(...participantCounts) : 0,
            };
            const monthlyStats = this.calculateMonthlyStats(meetings);
            const meetingsByMonth = this.calculateMeetingsByMonth(meetings);
            const participantsByMonth = this.calculateParticipantsByMonth(meetings);
            const statusDistribution = [
                { status: 'Actif', count: meetingStatusDistribution.active },
                { status: 'Terminé', count: meetingStatusDistribution.completed },
                { status: 'Inactif', count: meetingStatusDistribution.inactive },
            ];
            const recentMeetings = meetings.slice(0, 5).map(meeting => ({
                id: meeting.id,
                title: meeting.title,
                startDate: meeting.startDate.toISOString(),
                status: meeting.status,
                participants_count: meeting.participants?.length || 0,
            }));
            const maxParticipantsMeeting = meetings.length > 0 ?
                meetings.reduce((max, meeting) => (meeting.participants?.length || 0) > (max.participants?.length || 0) ? meeting : max) : null;
            const minParticipantsMeeting = meetings.length > 0 ?
                meetings.reduce((min, meeting) => (meeting.participants?.length || 0) < (min.participants?.length || 0) ? meeting : min) : null;
            return {
                totalMeetings,
                activeMeetings: meetingStatusDistribution.active,
                completedMeetings: meetingStatusDistribution.completed,
                totalParticipants,
                averageParticipants: participantStats.averagePerMeeting,
                meetingStatusDistribution,
                participantStats,
                monthlyStats,
                meetingsByMonth,
                participantsByMonth,
                statusDistribution,
                recentMeetings,
                participationRate: totalMeetings > 0 ? (participantStats.total / (totalMeetings * participantStats.averagePerMeeting)) * 100 : 0,
                maxParticipantsMeeting: maxParticipantsMeeting ? {
                    title: maxParticipantsMeeting.title,
                    count: maxParticipantsMeeting.participants?.length || 0
                } : undefined,
                minParticipantsMeeting: minParticipantsMeeting ? {
                    title: minParticipantsMeeting.title,
                    count: minParticipantsMeeting.participants?.length || 0
                } : undefined,
            };
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return this.getDefaultStats();
        }
    }
    calculateMonthlyStats(meetings) {
        const monthlyData = {};
        meetings.forEach(meeting => {
            if (meeting.startDate) {
                const monthKey = `${meeting.startDate.getFullYear()}-${(meeting.startDate.getMonth() + 1).toString().padStart(2, '0')}`;
                const monthName = meeting.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { meetings: 0, participants: 0 };
                }
                monthlyData[monthKey].meetings++;
                monthlyData[monthKey].participants += meeting.participants?.length || 0;
            }
        });
        return Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([monthKey, data]) => ({
            month: new Date(monthKey + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            meetings: data.meetings,
            participants: data.participants,
            averageParticipants: data.meetings > 0 ? data.participants / data.meetings : 0,
        }));
    }
    calculateMeetingsByMonth(meetings) {
        const monthCounts = {};
        meetings.forEach(meeting => {
            if (meeting.startDate) {
                const monthKey = `${meeting.startDate.getFullYear()}-${(meeting.startDate.getMonth() + 1).toString().padStart(2, '0')}`;
                const monthName = meeting.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                if (!monthCounts[monthKey]) {
                    monthCounts[monthKey] = 0;
                }
                monthCounts[monthKey]++;
            }
        });
        return Object.entries(monthCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([monthKey, count]) => ({
            month: new Date(monthKey + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            count,
        }));
    }
    calculateParticipantsByMonth(meetings) {
        const monthCounts = {};
        meetings.forEach(meeting => {
            if (meeting.startDate) {
                const monthKey = `${meeting.startDate.getFullYear()}-${(meeting.startDate.getMonth() + 1).toString().padStart(2, '0')}`;
                const participantsCount = meeting.participants?.length || 0;
                if (!monthCounts[monthKey]) {
                    monthCounts[monthKey] = 0;
                }
                monthCounts[monthKey] += participantsCount;
            }
        });
        return Object.entries(monthCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([monthKey, count]) => ({
            month: new Date(monthKey + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            count,
        }));
    }
    getDefaultStats() {
        return {
            totalMeetings: 0,
            activeMeetings: 0,
            completedMeetings: 0,
            totalParticipants: 0,
            averageParticipants: 0,
            meetingStatusDistribution: { active: 0, completed: 0, inactive: 0 },
            participantStats: { total: 0, averagePerMeeting: 0, maxInMeeting: 0, minInMeeting: 0 },
            monthlyStats: [],
            meetingsByMonth: [],
            participantsByMonth: [],
            statusDistribution: [],
            recentMeetings: [],
            participationRate: 0,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __param(1, (0, typeorm_1.InjectRepository)(participant_entity_1.Participant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map