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
  DocumentTextIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Types pour les données du dashboard
interface RecentMeeting {
  id: number;
  title: string;
  startDate: string;
  status: 'active' | 'completed' | 'inactive';
  participants_count?: number;
}

interface DashboardStats {
  totalMeetings: number;
  activeMeetings: number;
  completedMeetings: number;
  totalParticipants: number;
  averageParticipants: number;
  topOrganizers: { name: string; count: number }[];
  meetingsByMonth: { month: string; count: number }[];
  recentMeetings: RecentMeeting[];
}

export default function AdminDashboardPage() {
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

  const handleSettings = () => {
    console.log("Ouverture des paramètres...");
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-green-50/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">Chargement du tableau de bord...</p>
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
              <h1 className="text-4xl font-bold text-black">
                Tableau de Bord - Admin
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Vue d&apos;ensemble complète du système de gestion des réunions
              </p>
            </div>

            {/* Profil utilisateur en haut à droite */}
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Carte Total Réunions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalMeetings || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Total Réunions</div>
            </div>

            {/* Carte Réunions Actives */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.activeMeetings || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Réunions Actives</div>
            </div>

            {/* Carte Participants Totaux */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalParticipants || 0}
              </div>
              <div className="text-gray-600 text-sm font-medium">Participants Totaux</div>
            </div>

            {/* Carte Moyenne Participants */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.averageParticipants?.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600 text-sm font-medium">Moyenne Participants</div>
            </div>
          </div>

          {/* Graphiques et visualisations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Graphique des réunions par mois */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Réunions par Mois
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Graphique en développement</p>
              </div>
            </div>

            {/* Top organisateurs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Organisateurs
              </h3>
              <div className="space-y-3">
                {stats?.topOrganizers?.slice(0, 5).map((organizer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{organizer.name}</span>
                    <span className="text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded">
                      {organizer.count} réunions
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>

          {/* Réunions récentes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Réunions Récentes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Titre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentMeetings?.slice(0, 5).map((meeting, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{meeting.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(meeting.startDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : meeting.status === 'completed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {meeting.status === 'active' ? 'Actif' : meeting.status === 'completed' ? 'Terminé' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {meeting.participants_count || 0}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        Aucune réunion récente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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