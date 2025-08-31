'use client';
import { useState, useEffect } from 'react';
import {
  KeyIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';

interface Session {
  id: number;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress?: string;
  location?: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt?: string;
  isCurrent: boolean;
}

interface SecurityTabProps {
  refreshError?: string | null;
  onRefresh?: () => void;
}

export const SecurityTab = ({ refreshError, onRefresh }: SecurityTabProps) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validatePasswords = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('Tous les champs sont obligatoires');
      return false;
    }

    if (passwords.new.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (passwords.new !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(apiUrl('/auth/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe mis à jour avec succès');
        setPasswords({ current: '', new: '', confirm: '' });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMessage = data.message || data.error || 'Erreur lors de la mise à jour du mot de passe';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch(apiUrl('/sessions'), {
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sessions');
      }

      const sessionsData = await response.json();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Erreur lors du chargement des sessions:', err);
      setError('Impossible de charger les sessions actives');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleLogoutSession = async (sessionId: number) => {
    try {
      const response = await fetch(apiUrl(`/sessions/${sessionId}`), {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion de la session');
      }

      setSuccess('Session déconnectée avec succès');
      setTimeout(() => setSuccess(null), 3000);
      
      // Recharger les sessions
      await fetchSessions();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      setError('Erreur lors de la déconnexion de la session');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString('fr-FR');
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="p-8">
      {/* Error messages */}
      {(refreshError || error) && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{refreshError || error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sécurité du compte</h2>
        <p className="text-gray-600">Protégez votre compte avec des paramètres de sécurité avancés</p>
      </div>

      <div className="space-y-8">
        {/* Changer mot de passe avec accent orange */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <KeyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
              <p className="text-sm text-gray-600">Mettez à jour votre mot de passe régulièrement</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            onClick={handlePasswordUpdate}
            disabled={isLoading}
            className={`mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-orange-700'
            }`}
          >
            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </div>


        {/* Sessions actives */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <ComputerDesktopIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sessions actives</h3>
              <p className="text-sm text-gray-600">Gérez vos appareils connectés</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {loadingSessions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Chargement des sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <ComputerDesktopIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Aucune session active</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between py-3 px-4 bg-white rounded-lg border ${
                    session.isCurrent ? 'border-orange-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {session.deviceType.toLowerCase().includes('mobile') ? (
                      <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3" />
                    ) : (
                      <ComputerDesktopIcon className="w-5 h-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.browser} sur {session.os}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.location || 'Localisation inconnue'}
                        {session.isCurrent ? ' • Session actuelle' : ` • ${formatTimeAgo(session.lastActivity)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {session.isCurrent ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Déconnecter
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};