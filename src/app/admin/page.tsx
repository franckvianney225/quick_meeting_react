'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import { UserProfile } from '@/components/ui/UserProfile';
import AdminMeetings from './components/AdminMeetings';
import { ShieldCheckIcon, UsersIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'meetings' | 'users'>('meetings');

  const handleViewMeeting = (meetingId: number) => {
    console.log('View meeting:', meetingId);
    // Rediriger vers la page de détails de la réunion
    window.open(`/tasks?meetingId=${meetingId}`, '_blank');
  };

  const handleEditMeeting = (meetingId: number) => {
    console.log('Edit meeting:', meetingId);
    // Rediriger vers l'édition de la réunion
    window.open(`/tasks?meetingId=${meetingId}&edit=true`, '_blank');
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
                Administration
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Gestion complète du système - Réunions et utilisateurs
              </p>
            </div>

            {/* Profil utilisateur en haut à droite */}
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Navigation par onglets */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('meetings')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center space-x-3 ${
                  activeTab === 'meetings'
                    ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
                <span>Réunions</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center space-x-3 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <UsersIcon className="h-5 w-5" />
                <span>Utilisateurs</span>
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'meetings' && (
            <AdminMeetings
              onViewMeeting={handleViewMeeting}
              onEditMeeting={handleEditMeeting}
            />
          )}

          {activeTab === 'users' && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UsersIcon className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-500 text-xl font-medium">Gestion des utilisateurs</p>
                <p className="text-gray-400 text-sm mt-2">
                  Cette fonctionnalité sera disponible prochainement
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}