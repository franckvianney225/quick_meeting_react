'use client';

import { AuthService } from './auth';
import { apiUrl } from './api';

export interface Meeting {
  id: number;
  unique_code: string;
  title: string;
  start_date: string;
  description: string;
  status: string;
  location: string;
  max_participants: number;
  qr_code: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  participants_count?: number;
}

export interface Participant {
  id: number;
  name: string;
  prenom: string;
  email: string;
  phone: string;
  fonction: string;
  organisation: string;
  signature: string;
  created_at: string;
  submitted_at: string;
  meeting_id: number;
}

export interface MeetingStats {
  totalMeetings: number;
  activeMeetings: number;
  inactiveMeetings: number;
  totalParticipants: number;
  completedMeetings: number;
}

export class MeetingService {
  private static readonly BASE_URL = apiUrl('/meetings');

  static async getAllMeetings(): Promise<Meeting[]> {
    try {
      const response = await fetch(this.BASE_URL, {
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des réunions:', error);
      throw error;
    }
  }

  static async getMeetingStats(): Promise<MeetingStats> {
    try {
      const meetings = await this.getAllMeetings();
      
      // Calculer les statistiques basées sur les réunions récupérées
      const totalMeetings = meetings.length;
      const activeMeetings = meetings.filter(meeting =>
        meeting.status === 'active' || meeting.status === 'scheduled'
      ).length;
      
      const completedMeetings = meetings.filter(meeting =>
        meeting.status === 'completed' || meeting.status === 'finished'
      ).length;

      // Calculer les réunions inactives (toutes les réunions qui ne sont ni actives ni terminées)
      const inactiveMeetings = meetings.filter(meeting =>
        meeting.status !== 'active' &&
        meeting.status !== 'scheduled' &&
        meeting.status !== 'completed' &&
        meeting.status !== 'finished'
      ).length;

      // Pour le nombre total de participants, nous devrions idéalement avoir un endpoint dédié
      // Pour l'instant, nous utilisons une valeur par défaut basée sur les données disponibles
      const totalParticipants = meetings.reduce((total, meeting) => {
        return total + (meeting.participants_count || 0);
      }, 0);

      return {
        totalMeetings,
        activeMeetings,
        inactiveMeetings,
        totalParticipants,
        completedMeetings
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalMeetings: 0,
        activeMeetings: 0,
        inactiveMeetings: 0,
        totalParticipants: 0,
        completedMeetings: 0
      };
    }
  }

  static async getRecentMeetings(limit: number = 5): Promise<Meeting[]> {
    try {
      const meetings = await this.getAllMeetings();
      
      // Trier par date de création décroissante et limiter le nombre
      return meetings
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des réunions récentes:', error);
      return [];
    }
  }

  static async getMeetingParticipants(meetingId: number): Promise<Participant[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${meetingId}/participants`, {
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des participants:', error);
      throw error;
    }
  }
}