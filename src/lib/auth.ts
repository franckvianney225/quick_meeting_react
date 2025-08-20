'use client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: Date | null;
  avatar?: string;
  civility?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly USER_KEY = 'user';

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur de connexion');
    }

    return response.json();
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log('=== AUTH SERVICE GET USER ===');
    console.log('User from localStorage:', user);
    console.log('User name:', user?.name);
    console.log('User civility:', user?.civility);
    console.log('User role:', user?.role);
    console.log('User email:', user?.email);
    console.log('=============================');
    
    return user;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static clearAllAuthData(): void {
    console.log('Nettoyage de toutes les données d\'authentification...');
    console.log('Avant nettoyage - localStorage:', Object.keys(localStorage));
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Nettoyer également les éventuels autres éléments liés à l'authentification
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key?.includes('token') || key?.includes('user'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('Suppression de la clé:', key);
      localStorage.removeItem(key);
    });
    
    console.log('Après nettoyage - localStorage:', Object.keys(localStorage));
    console.log('Toutes les données d\'authentification ont été nettoyées');
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static validateToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    return !this.isTokenExpired(token);
  }

  static async refreshUserData(): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) return;

      const response = await fetch('http://localhost:3001/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        this.setUser(userData);
        console.log('User data refreshed:', userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }
}