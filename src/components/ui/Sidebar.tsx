'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ClipboardDocumentIcon,
  UserIcon,
  CogIcon,
  ChevronUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Détection du type d'appareil
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide après 5 secondes seulement sur desktop
  useEffect(() => {
    if (!isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [pathname, isMobile]);

  // Gestion du hover avec délais seulement sur desktop
  const handleMouseEnter = () => {
    if (!isMobile && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isMobile) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    }
  };

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flèche indicatrice - seulement sur desktop */}
      {!isMobile && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isVisible ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
        >
          <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-full p-3 shadow-lg cursor-pointer">
            <ChevronUpIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      {/* Sidebar principale - toujours visible sur mobile */}
      <nav
        className={`transition-all duration-700 ease-out ${
          isMobile
            ? 'opacity-100 translate-y-0 scale-100' // Toujours visible sur mobile
            : isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3 sm:px-6 md:px-8 py-2 sm:py-4 shadow-xl border border-white/20 ring-1 ring-gray-200/50 mx-2 sm:mx-0">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
            {[
              { href: '/', icon: HomeIcon, title: 'Accueil' },
              { href: '/tasks', icon: ClipboardDocumentIcon, title: 'Réunions' },
              { href: '/profile', icon: UserIcon, title: 'Profil' },
              // Afficher les paramètres uniquement pour les administrateurs
              ...(user?.role && ['admin', 'administrator', 'Admin'].includes(user.role) ? [
                { href: '/settings', icon: CogIcon, title: 'Paramètres' },
                { href: '/admin', icon: ShieldCheckIcon, title: 'Administration' }
              ] : [])
            ].map(({ href, icon: Icon, title }) => (
              <Link
                key={href}
                href={href}
                className="relative p-2 sm:p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-green-50 transition-all duration-300 hover:scale-110 active:scale-95 group"
                title={title}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${
                  pathname === href
                    ? 'text-orange-500 scale-110'
                    : 'text-gray-600 group-hover:text-orange-500 group-hover:scale-105'
                }`} />

                {/* Indicateur de page active */}
                {pathname === href && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-green-600 rounded-full"></div>
                  </div>
                )}

                {/* Effet de hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 to-green-600/0 group-hover:from-orange-500/10 group-hover:to-green-600/10 transition-all duration-300"></div>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
