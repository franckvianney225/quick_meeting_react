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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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
    <main className="min-h-screen bg-gray-50 pb-24 pt-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header avec profil utilisateur */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour 👋 {user.civility ? `${user.civility} ` : ''}
              <br/>
              {user.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenu sur votre tableau de bord. Ici vous pourrez gérer vos réunions et récupérer les listes de présence
            </p>
            
          </div>
          
          {/* Profil utilisateur en haut à droite */}
          <UserProfile
            user={currentUser}
            onLogout={handleLogout}
            onProfile={handleProfile}
          />
        </div>

        {/* Le reste du code reste identique */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
         title="Total Réunions"
         value={stats.totalMeetings}
         icon={CalendarIcon}
         color="blue"
         trend={0}
       />
       <StatCard
         title="Réunions Actives"
         value={stats.activeMeetings}
         icon={ClockIcon}
         color="green"
         trend={0}
       />
       <StatCard
         title="Réunion inactive"
         value={stats.inactiveMeetings}
         icon={ClockIcon}
         color="red"
         trend={0}
       />
       <StatCard
         title="Terminées"
         value={stats.completedMeetings}
         icon={CheckCircleIcon}
         color="orange"
         trend={0}
       />
        </div>
        {/* Recent Meetings */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Réunions Récentes</h2>
            <Link
              href="/tasks"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Voir tout →
            </Link>
          </div>
          
          <div className="space-y-4">
           {recentMeetings.length > 0 ? (
             recentMeetings.map((meeting) => (
               <div
                 key={meeting.id}
                 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
               >
                 <div className="flex-1">
                   <h3 className="font-medium text-gray-800">{meeting.title}</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     {meeting.location} • {meeting.participants_count || 0} participants
                   </p>
                 </div>
                 <div className="flex items-center space-x-4">
                   <span className="text-sm text-gray-500">
                     {new Date(meeting.start_date).toLocaleDateString('fr-FR')}
                   </span>
                   <span className={`
                     px-3 py-1 rounded-full text-xs font-medium
                     ${meeting.status === 'active' || meeting.status === 'scheduled'
                       ? 'bg-green-100 text-green-800'
                       : 'bg-gray-100 text-gray-800'
                     }
                   `}>
                     {meeting.status === 'active' || meeting.status === 'scheduled' ? 'Active' : 'Terminée'}
                   </span>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center py-8 text-gray-500">
               <p>Aucune réunion trouvée</p>
               <p className="text-sm mt-2">Créez votre première réunion pour commencer</p>
             </div>
           )}
         </div>
        </Card>
      </div>
    </main>
  );
}
