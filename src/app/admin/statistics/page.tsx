
'use client';
import { useState, useEffect } from 'react';
import { UserProfile } from '@/components/ui/UserProfile';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';

// Types pour les données du dashboard
interface RecentMeeting {
  id: number;
  title: string;
  startDate: string;
  status: string;
  participants_count?: number;
}

interface MeetingStatusDistribution {
  active: number;
  completed: number;
  inactive: number;
}

interface ParticipantStats {
  total: number;
  averagePerMeeting: number;
  maxInMeeting: number;
  minInMeeting: number;
}

interface MonthlyStats {
  month: string;
  meetings: number;
  participants: number;
  averageParticipants: number;
}

interface DashboardStats {
  totalMeetings: number;
  activeMeetings: number;
  completedMeetings: number;
  totalParticipants: number;
  averageParticipants: number;
  
  meetingStatusDistribution: MeetingStatusDistribution;
  participantStats: ParticipantStats;
  monthlyStats: MonthlyStats[];
  
  meetingsByMonth: { month: string; count: number }[];
  participantsByMonth: { month: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  
  recentMeetings: RecentMeeting[];
  
  participationRate: number;
  maxParticipantsMeeting?: { title: string; count: number };
  minParticipantsMeeting?: { title: string; count: number };
}

export default function AdminStatisticsPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(apiUrl('/dashboard/stats'), {
          headers: AuthService.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Données utilisateur connecté
  const currentUser = {
    id: user?.id?.toString() || "1",
    name: user?.name || "Administrateur",
    role: user?.role || "Admin",
    email: user?.email || "",
    avatar: user?.avatar
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-green-50/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">Chargement des statistiques...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-green-50/80 pb-24 pt-4 w-full relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header avec profil utilisateur */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-4xl font-bold text-black">
                  Statistiques - Admin
                </h1>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Vue d&apos;ensemble complète des données du système
              </p>
            </div>

            {/* Profil utilisateur en haut à droite */}
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Statistiques principales - Grille de 6 cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {/* Carte Total Réunions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalMeetings || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Total Réunions</div>
            </div>

            {/* Carte Réunions Actives */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.activeMeetings || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Réunions Actives</div>
            </div>

            {/* Carte Participants Totaux */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <UsersIcon className="w-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalParticipants || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Participants Totaux</div>
            </div>

            {/* Carte Moyenne Participants */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.averageParticipants?.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600 text-sm font-medium">Moyenne Participants</div>
            </div>

            {/* Carte Participation Max */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.participantStats?.maxInMeeting || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Max Participants</div>
            </div>

            {/* Carte Taux de Participation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <BuildingOfficeIcon className="w-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.participationRate?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-gray-600 text-sm font-medium">Taux Participation</div>
            </div>
          </div>

          {/* Graphiques et visualisations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Graphique des réunions par mois */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Évolution des Réunions
                </h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <DocumentArrowDownIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {stats?.meetingsByMonth && stats.meetingsByMonth.length > 0 ? (
                <LineChart
                  data={{
                    labels: stats.meetingsByMonth.map(item => item.month),
                    datasets: [
                      {
                        label: 'Réunions',
                        data: stats.meetingsByMonth.map(item => item.count),
                        borderColor: 'rgba(79, 70, 229, 1)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                  title="Évolution mensuelle des réunions"
                  height={300}
                />
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Répartition par statut */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Répartition par Statut
                </h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <DocumentArrowDownIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {stats?.meetingStatusDistribution && stats.totalMeetings > 0 ? (
                <PieChart
                  data={{
                    labels: ['Actif', 'Terminé', 'Inactif'],
                    datasets: [
                      {
                        label: 'Réunions par statut',
                        data: [
                          stats.meetingStatusDistribution.active,
                          stats.meetingStatusDistribution.completed,
                          stats.meetingStatusDistribution.inactive,
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',  // Vert pour actif
                          'rgba(239, 68, 68, 0.8)',  // Rouge pour terminé
                          'rgba(156, 163, 175, 0.8)', // Gris pour inactif
                        ],
                      },
                    ],
                  }}
                  title="Répartition des statuts"
                  height={300}
                />
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graphique de comparaison mensuelle */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparaison Mensuelle
              </h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <DocumentArrowDownIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {stats?.monthlyStats && stats.monthlyStats.length > 0 ? (
              <BarChart
                data={{
                  labels: stats.monthlyStats.map(item => item.month),
                  datasets: [
                    {
                      label: 'Réunions',
                      data: stats.monthlyStats.map(item => item.meetings),
                      backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    },
                    {
                      label: 'Participants',
                      data: stats.monthlyStats.map(item => item.participants),
                      backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    },
                  ],
                }}
                title="Comparaison réunions vs participants"
                height={300}
                stacked={false}
              />
            ) : (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Aucune donnée mensuelle disponible</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Statistiques des participants */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques des Participants
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Moyenne par réunion</span>
                  <span className="font-semibold">{stats?.participantStats?.averagePerMeeting?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maximum dans une réunion</span>
                  <span className="font-semibold">{stats?.participantStats?.maxInMeeting || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Minimum dans une réunion</span>
                  <span className="font-semibold">{stats?.participantStats?.minInMeeting || 0}</span>
                </div>
                {stats?.maxParticipantsMeeting && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Réunion la plus populaire</span>
                    <span className="font-semibold text-sm text-right">
                      {stats.maxParticipantsMeeting.title}<br/>
                      <span className="text-blue-600">{stats.maxParticipantsMeeting.count} participants</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques mensuelles */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Mensuelle
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats?.monthlyStats?.slice(-6).reverse().map((month, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{month.month}</span>
                    <div className="text-right">
                      <div className="font-semibold">{month.meetings} réunions</div>
                      <div className="text-xs text-gray-500">{month.participants} participants</div>
                    </div>
                  </div>
                ))}
                {(!stats?.monthlyStats || stats.monthlyStats.length === 0) && (
                  <p className="text-gray-400 text-center py-4">Aucune donnée mensuelle</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}