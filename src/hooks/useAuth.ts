'use client';
import { useState, useEffect } from 'react';
import { AuthService, User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = AuthService.getToken();
      const userData = AuthService.getUser();
      
      setIsAuthenticated(!!token);
      setUser(userData);
      setLoading(false);
    };

    checkAuth();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await AuthService.login(email, password);
      AuthService.setToken(data.access_token);
      AuthService.setUser(data.user);
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
}