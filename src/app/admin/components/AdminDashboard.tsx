'use client';
import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import { 
  ClipboardDocumentIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Meeting {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'inactive';
  start_date: string;
  location: string;
  max_participants: number;
  uniqueCode: string;
  created_at: string;
  participants_count: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

interface DashboardStats {
  totalMeetings: number;
  totalParticipants: number;
  activeMeetings: number;
  inactiveMeetings: number;
  recentMeetings: Meeting[];
}

interface AdminDashboardProps {
  onViewMeeting: (meetingId: number) => void;
  onEditMeeting: (meetingId: number) => void;
}

export default function AdminDashboard({ onViewMeeting, onEditMeeting }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    totalParticipants: 0,
    activeMeetings: 0,
    inactiveMeetings: 0,
    recentMeetings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/meetings/all'), {
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const meetings: Meeting[] = await response.json();
      
      // Calculer les statistiques
      const totalParticipants = meetings.reduce((sum, meeting) => sum + (meeting.participants_count || 0), 0);
      const activeMeetings = meetings.filter(m => m.status === 'active').length;
      const inactiveMeetings = meetings.filter(m => m.status === 'inactive').length;
      
      // Récupérer les 5 réunions les plus récentes
      const recentMeetings = meetings
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        totalMeetings: meetings.length,
        totalParticipants,
        activeMeetings,
        inactiveMeetings,
        recentMeetings
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
  }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardDocumentIcon className="w-8 h-8 text-white" />
        </div>
        <p className="text-red-500 text-lg mb-2">Erreur</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl hover:from-orange-600 hover:to-green-700 transition-all duration-300 font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toutes les réunions"
          value={stats.totalMeetings}
          icon={ClipboardDocumentIcon}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total participants"
          value={stats.totalParticipants}
          icon={UsersIcon}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Réunions actives"
          value={stats.activeMeetings}
          icon={CheckCircleIcon}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Réunions inactives"
          value={stats.inactiveMeetings}
          icon={ClockIcon}
          color="bg-gradient-to-r from-gray-500 to-gray-600"
        />
      </div>

      {/* Réunions récentes */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50/80 to-green-50/80 border-b border-orange-200/30">
          <h2 className="text-xl font-semibold text-gray-900">Réunions récentes</h2>
          <p className="text-gray-600 text-sm">Les 5 dernières réunions créées</p>
        </div>

        <div className="p-6">
          {stats.recentMeetings.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardDocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune réunion récente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-600">
                      Créé le {new Date(meeting.created_at).toLocaleDateString('fr-FR')} • 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : meeting.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {meeting.status === 'active' ? 'Actif' : meeting.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {meeting.participants_count} participants
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewMeeting(meeting.id)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditMeeting(meeting.id)}
                      className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}