'use client';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Ne pas afficher le sidebar sur la page de login
  const showSidebar = isAuthenticated && pathname !== '/login';

  return (
    <>
      {children}
      {showSidebar && <Sidebar />}
    </>
  );
}