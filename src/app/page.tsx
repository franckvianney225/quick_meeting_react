'use client'; // Ajouter cette directive en haut du fichier

import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { QuickActionCard } from '../components/ui/QuickActionCard';
import { UserProfile } from '../components/ui/UserProfile';
import {
  CalendarIcon,
  UserGroupIcon,
  QrCodeIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/lib/auth';
import { MeetingService, Meeting, MeetingStats } from '@/lib/meeting';

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MeetingStats>({
    totalMeetings: 0,
    activeMeetings: 0,
    inactiveMeetings: 0,
    totalParticipants: 0,
    completedMeetings: 0
  });
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Charger les données du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);

        // Charger les statistiques et les réunions récentes en parallèle
        const [meetingStats, recentMeetingsData] = await Promise.all([
          MeetingService.getMeetingStats(),
          MeetingService.getRecentMeetings(5)
        ]);

        setStats(meetingStats);
        setRecentMeetings(recentMeetingsData);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Rediriger vers le login si non authentifié et forcer la mise à jour des données
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Forcer la mise à jour des données utilisateur au chargement
      AuthService.refreshUserData().catch(console.error);
    }
  }, [user, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Debug: vérifier les données utilisateur
  console.log('=== DONNÉES UTILISATEUR ===');
  console.log('User object:', user);
  console.log('Civilité:', user.civility);
  console.log('Has civility:', !!user.civility);
  console.log('==========================');

  // Données utilisateur
  const currentUser = {
    id: user.id.toString(),
    name: user.name,
    role: user.role,
    email: user.email,
    avatar: user.avatar, // Ajouter l'avatar
    civility: user.civility // Ajouter la civilité
  };


  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleClearStorage = () => {
    AuthService.clearAllAuthData();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-green-50/80 pb-24 pt-4 w-full relative overflow-hidden">
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
              Bonjour 👋 {user.civility ? `${user.civility} ` : ''}
              <br/>
              {user.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
              Bienvenu sur votre tableau de bord. Ici vous pourrez gérer vos réunions et récupérer les listes de présence
            </p>
          </div>

          {/* Profil utilisateur en haut à droite */}
          <div className="-mt-8">
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
              onProfile={handleProfile}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/tasks">
            <StatCard
              title="Total Réunions"
              value={stats.totalMeetings}
              icon={CalendarIcon}
              color="gray"
              trend={0}
            />
          </Link>
          <Link href="/tasks?status=inactive">
            <StatCard
              title="Réunion inactive"
              value={stats.inactiveMeetings}
              icon={ClockIcon}
              color="blue"
              trend={0}
            />
          </Link>
          <Link href="/tasks?status=active">
            <StatCard
              title="Réunions Actives"
              value={stats.activeMeetings}
              icon={ClockIcon}
              color="green"
              trend={0}
            />
          </Link>
          <Link href="/tasks?status=completed">
            <StatCard
              title="Terminées"
              value={stats.completedMeetings}
              icon={CheckCircleIcon}
              color="red"
              trend={0}
            />
          </Link>
        </div>

        {/* Recent Meetings */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Réunions Récentes</h2>
            </div>
            <Link
              href="/tasks"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              Voir tout →
            </Link>
          </div>

          <div className="space-y-4">
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting, index) => (
                <div
                  key={meeting.id}
                  className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white/80 hover:border-orange-200/50 hover:shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => router.push(`/tasks?meetingId=${meeting.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span>{meeting.participants_count || 0} participants</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>{meeting.location}</span>
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(meeting.start_date).toLocaleDateString('fr-FR')}
                    </span> */}
                    <span className={`
                      px-4 py-2 rounded-full text-xs font-bold transition-all duration-300
                      ${meeting.status === 'active' || meeting.status === 'scheduled'
                        ? 'bg-green-500 text-white shadow-md hover:shadow-lg'
                        : meeting.status === 'inactive'
                        ? 'bg-blue-500 text-white shadow-md hover:shadow-lg'
                        : meeting.status === 'completed'
                        ? 'bg-red-500 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-500 text-white shadow-md hover:shadow-lg'
                      }
                    `}>
                      {meeting.status === 'active' || meeting.status === 'scheduled'
                        ? 'Active'
                        : meeting.status === 'inactive'
                        ? 'En attente'
                        : meeting.status === 'completed'
                        ? 'Terminée'
                        : 'Inconnu'
                      }
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Aucune réunion trouvée</p>
                <p className="text-gray-400 text-sm mt-2">Créez votre première réunion pour commencer</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
