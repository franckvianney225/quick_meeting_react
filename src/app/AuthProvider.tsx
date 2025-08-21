'use client';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  // Ne pas afficher le sidebar sur la page de login
  // Afficher le sidebar seulement si l'authentification est confirmée (pas en cours de chargement)
  const showSidebar = !loading && isAuthenticated && pathname !== '/login';

  return (
    <>
      {children}
      {showSidebar && <Sidebar />}
    </>
  );
}