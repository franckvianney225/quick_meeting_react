'use client';
import { useState, useEffect } from 'react';
import { AuthService, User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getToken();
      let userData = AuthService.getUser();
      
      console.log('=== USE AUTH CHECK ===');
      console.log('Token present:', !!token);
      console.log('User data from storage:', userData);
      console.log('User civility:', userData?.civility);
      
      if (!token) {
        // Pas de token, utilisateur non authentifié
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Vérifier si le token est valide (non expiré)
      const isValid = AuthService.validateToken();
      
      // Si l'utilisateur est incomplet (manque name), rafraîchir depuis l'API
      if (isValid && userData && (!userData.name || !userData.email)) {
        console.log('User data incomplete, refreshing from API...');
        try {
          await AuthService.refreshUserData();
          userData = AuthService.getUser();
          console.log('User data after refresh:', userData);
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
      
      setIsAuthenticated(isValid);
      setUser(isValid ? userData : null);
      setLoading(false);
    };

    checkAuth();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      checkAuth();
    };
  
    // Écouter aussi les événements personnalisés pour les mises à jour d'authentification
    const handleAuthUpdate = () => {
      checkAuth();
    };
  
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authUpdate', handleAuthUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await AuthService.login(email, password);
      AuthService.setToken(data.access_token);
      AuthService.setUser(data.user);
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Déclencher un événement pour notifier les autres instances de useAuth
      window.dispatchEvent(new CustomEvent('authUpdate'));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    
    // Déclencher un événement pour notifier les autres instances de useAuth
    window.dispatchEvent(new CustomEvent('authUpdate'));
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
}