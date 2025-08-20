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
import { useEffect } from 'react';
import { AuthService } from '@/lib/auth';

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const stats = {
    totalMeetings: 24,
    activeMeetings: 8,
    totalParticipants: 156,
    completedMeetings: 16
  };

  // Rediriger vers le login si non authentifié et forcer la mise à jour des données
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Forcer la mise à jour des données utilisateur au chargement
      AuthService.refreshUserData().catch(console.error);
    }
  }, [user, loading, router]);

  if (loading) {
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

  const recentMeetings = [
    {
      id: 1,
      title: "Réunion Budget 2024",
      status: "active",
      participants: 12,
      date: "2024-08-15",
      location: "Salle A"
    },
    {
      id: 2,
      title: "Formation Sécurité",
      status: "completed",
      participants: 25,
      date: "2024-08-12",
      location: "Amphithéâtre"
    },
    {
      id: 3,
      title: "Point Mensuel",
      status: "active",
      participants: 8,
      date: "2024-08-18",
      location: "Bureau Direction"
    }
  ];

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
            trend={12}
          />
          <StatCard
            title="Réunions Actives"
            value={stats.activeMeetings}
            icon={ClockIcon}
            color="green"
            trend={5}
          />
          <StatCard
            title="Participants"
            value={stats.totalParticipants}
            icon={UserGroupIcon}
            color="purple"
            trend={8}
          />
          <StatCard
            title="Terminées"
            value={stats.completedMeetings}
            icon={CheckCircleIcon}
            color="orange"
            trend={-2}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="Nouvelle Réunion"
              description="Créer une nouvelle réunion avec QR code"
              href="/meetings/create"
              icon={PlusIcon}
              color="blue"
            />
            <QuickActionCard
              title="Générer QR Code"
              description="Générer un QR code pour une réunion"
              href="/qr-generator"
              icon={QrCodeIcon}
              color="green"
            />
            <QuickActionCard
              title="Rapports"
              description="Voir les statistiques et rapports"
              href="/reports"
              icon={ChartBarIcon}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Meetings */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Réunions Récentes</h2>
            <Link 
              href="/meetings" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Voir tout →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentMeetings.map((meeting) => (
              <div 
                key={meeting.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{meeting.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {meeting.location} • {meeting.participants} participants
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{meeting.date}</span>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${meeting.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {meeting.status === 'active' ? 'Active' : 'Terminée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
