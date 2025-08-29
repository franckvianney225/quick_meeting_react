import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from '../meeting/meeting.entity';
import { Participant } from '../participant/participant.entity';
import { DashboardStats, MeetingStatusDistribution, ParticipantStats, MonthlyStats } from './dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Récupérer toutes les données
      const meetings = await this.meetingRepository.find({
        relations: ['participants'],
        order: { startDate: 'DESC' },
      });

      const participants = await this.participantRepository.find();
      // Calculer les statistiques de base
      const totalMeetings = meetings.length;
      const totalParticipants = participants.length;
      const totalOrganizations = 1; // Valeur par défaut pour l'instant

      // Distribution des statuts de réunion
      const meetingStatusDistribution: MeetingStatusDistribution = {
        active: meetings.filter(m => m.status === 'active').length,
        completed: meetings.filter(m => m.status === 'completed').length,
        inactive: meetings.filter(m => m.status === 'inactive').length,
      };

      // Statistiques des participants
      const participantCounts = meetings.map(m => m.participants?.length || 0);
      const participantStats: ParticipantStats = {
        total: totalParticipants,
        averagePerMeeting: totalMeetings > 0 ? participantCounts.reduce((a, b) => a + b, 0) / totalMeetings : 0,
        maxInMeeting: participantCounts.length > 0 ? Math.max(...participantCounts) : 0,
        minInMeeting: participantCounts.length > 0 ? Math.min(...participantCounts) : 0,
      };

      // Statistiques mensuelles
      const monthlyStats = this.calculateMonthlyStats(meetings);
      

      // Données pour graphiques
      const meetingsByMonth = this.calculateMeetingsByMonth(meetings);
      const participantsByMonth = this.calculateParticipantsByMonth(meetings);
      const statusDistribution = [
        { status: 'Actif', count: meetingStatusDistribution.active },
        { status: 'Terminé', count: meetingStatusDistribution.completed },
        { status: 'Inactif', count: meetingStatusDistribution.inactive },
      ];

      // Réunions récentes
      const recentMeetings = meetings.slice(0, 5).map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        startDate: meeting.startDate.toISOString(),
        status: meeting.status,
        participants_count: meeting.participants?.length || 0,
      }));

      // Taux de participation et réunions extrêmes
      const maxParticipantsMeeting = meetings.length > 0 ? 
        meetings.reduce((max, meeting) => 
          (meeting.participants?.length || 0) > (max.participants?.length || 0) ? meeting : max
        ) : null;

      const minParticipantsMeeting = meetings.length > 0 ? 
        meetings.reduce((min, meeting) => 
          (meeting.participants?.length || 0) < (min.participants?.length || 0) ? meeting : min
        ) : null;

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
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des valeurs par défaut structurées
      return this.getDefaultStats();
    }
  }

  private calculateMonthlyStats(meetings: Meeting[]): MonthlyStats[] {
    const monthlyData: { [key: string]: { meetings: number; participants: number } } = {};
    
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

  private calculateMeetingsByMonth(meetings: Meeting[]): { month: string; count: number }[] {
    const monthCounts: { [key: string]: number } = {};
    
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

  private calculateParticipantsByMonth(meetings: Meeting[]): { month: string; count: number }[] {
    const monthCounts: { [key: string]: number } = {};
    
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

  private getDefaultStats(): DashboardStats {
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
}