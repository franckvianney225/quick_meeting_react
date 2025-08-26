'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import { UserProfile } from '@/components/ui/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import AdminMeetings from './components/AdminMeetings';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'meetings'>('dashboard');

  const handleViewMeeting = (meetingId: number) => {
    console.log('View meeting:', meetingId);
    // Rediriger vers la page de détails de la réunion dans le même onglet
    window.location.href = `/tasks?meetingId=${meetingId}`;
  };

  const handleEditMeeting = (meetingId: number) => {
    console.log('Edit meeting:', meetingId);
    // Rediriger vers l'édition de la réunion dans le même onglet
    window.location.href = `/tasks?meetingId=${meetingId}&edit=true`;
  };

  const handleLogout = () => {
    logout();
  };

  // Données utilisateur connecté
  const currentUser = {
    id: user?.id?.toString() || "1",
    name: user?.name || "Utilisateur",
    role: user?.role || "Utilisateur",
    email: user?.email || "",
    avatar: user?.avatar
  };

  if (!user?.role || !['admin', 'administrator', 'Admin'].includes(user.role)) {
    console.log('Access denied - User role:', user?.role);
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-green-50/80 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 text-center">
            <ShieldCheckIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-6">Cette page est réservée aux administrateurs.</p>
            <p className="text-gray-500 text-sm mb-4">Rôle actuel: {user?.role || 'Non défini'}</p>
            <button
              onClick={() => window.location.href = '/tasks'}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl hover:from-orange-600 hover:to-green-700 transition-all duration-300 font-semibold"
            >
              Retour aux réunions
            </button>
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
                Tableau de bord Administrateur
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Statistiques et gestion complète des réunions
              </p>
            </div>

            {/* Profil utilisateur en haut à droite */}
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Afficher directement le contenu des réunions avec statistiques */}
          <AdminMeetings
            onViewMeeting={handleViewMeeting}
            onEditMeeting={handleEditMeeting}
          />
        </div>
      </div>
    </AuthGuard>
  );
}