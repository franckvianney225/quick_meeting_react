'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileTabContent } from './components/ProfileTabContent';
import { AvatarUploadModal } from './components/AvatarUploadModal';
import { AuthService } from '@/lib/auth';
import { apiUrl, getAvatarUrl } from '@/lib/api';

function ProfilePage() {
  const [user, setUser] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    role: 'Administrateur',
    department: 'Ministère de l\'Intérieur',
    position: '',
    civility: '',
    avatar: '/default-avatar.jpg',
    joinedDate: '15 janvier 2023',
    lastLogin: '2 heures'
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsRefreshing(true);
      setRefreshError(null);
      try {
        const currentUser = AuthService.getUser();
        if (!currentUser) {
          throw new Error('Utilisateur non connecté');
        }

        const response = await fetch(apiUrl(`/users/${currentUser.id}/profile`), {
          headers: AuthService.getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Erreur de chargement');
        const data = await response.json();
        setUser({
          ...data,
          phone: data.phone || '',
          department: data.department || '',
          position: data.position || '',
          civility: data.civility || '',
          role: data.role || 'Utilisateur',
          avatar: getAvatarUrl(data.avatar),
          joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Date inconnue',
          lastLogin: data.last_login ? new Date(data.last_login).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Jamais'
        });
      } catch (error) {
        setRefreshError(error instanceof Error ? error.message : 'Erreur inconnue');
        console.error('Erreur:', error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    fetchUserData();
  }, [refreshKey]);

  const handleSave = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Préparer les données pour l'API
      const profileData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        position: user.position,
        civility: user.civility
      };

      const response = await fetch(apiUrl(`/users/${currentUser.id}/profile`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }
      
      setIsEditing(false);
      setRefreshKey(prev => prev + 1); // Force le rafraîchissement
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset des changements si nécessaire
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAvatarEdit = () => {
    setIsAvatarModalOpen(true);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(apiUrl(`/users/${currentUser.id}/avatar`), {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload de l\'avatar');
      }

      const result = await response.json();
      
      // Mettre à jour l'avatar localement avec l'URL complète
      const fullAvatarUrl = getAvatarUrl(result.avatarUrl);
      setUser(prev => ({ ...prev, avatar: fullAvatarUrl }));
      
      // Rafraîchir les données
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isRefreshing && (
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
        
        <ProfileHeader 
          title="Mon Profil"
          description="Gérez vos informations personnelles et préférences"
          isRefreshing={isRefreshing}
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1">
            <ProfileSidebar
              user={user}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAvatarEdit={handleAvatarEdit}
            />
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <ProfileTabContent
              activeTab={activeTab}
              user={user}
              isEditing={isEditing}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              refreshError={refreshError}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
  
        {/* Modal d'upload d'avatar */}
        <AvatarUploadModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onUpload={handleAvatarUpload}
          currentAvatar={user.avatar}
        />
      </div>
    </div>
  );
}

export default function ProfilePageWrapper() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}
