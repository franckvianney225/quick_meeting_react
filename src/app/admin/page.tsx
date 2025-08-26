'use client';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import { UserProfile } from '@/components/ui/UserProfile';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { user, logout } = useAuth();

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
          {/* En-tête */}
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

          {/* Rediriger vers la page de gestion des réunions admin */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tableau de bord Administrateur</h2>
            <p className="text-gray-600 mb-8">Gestion complète des réunions et statistiques</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => window.location.href = '/admin/meetings'}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl hover:from-orange-600 hover:to-green-700 transition-all duration-300 font-semibold text-lg"
              >
                Gérer les réunions
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/statistics'}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 font-semibold text-lg"
              >
                Voir les statistiques
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}