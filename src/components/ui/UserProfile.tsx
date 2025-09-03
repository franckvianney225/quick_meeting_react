'use client';
import { useState } from 'react';
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getAvatarUrl } from '@/lib/api';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    email?: string;
    civility?: string;
  };
  onLogout?: () => void;
  onProfile?: () => void; // Changé de onSettings à onProfile
}

export const UserProfile = ({ user, onLogout, onProfile }: UserProfileProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout?.();
    // Actualiser la page après la déconnexion pour un redémarrage complet
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    onProfile?.(); // Redirection vers la page profil
  };

  return (
    <div className="relative">
      {/* Bouton principal - design modernisé */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-orange-500/20 focus:ring-offset-1 sm:focus:ring-offset-2 min-w-0 sm:min-w-[180px] lg:min-w-[220px] shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl border border-white/30"
      >
        {/* Avatar - avec effets */}
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0">
          {user.avatar && !user.avatar.includes('/default-avatar.jpg') ? (
            <Image
              src={getAvatarUrl(user.avatar)}
              alt={`Photo de ${user.name}`}
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 sm:border-3 border-orange-200 shadow-md hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200">
              <span className="text-white font-semibold text-sm sm:text-base lg:text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.role?.charAt(0) || 'U'}
              </span>
            </div>
          )}

          {/* Indicateur de statut en ligne */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-green-400 border-2 sm:border-3 border-white rounded-full animate-pulse shadow-sm"></div>
        </div>

        {/* Informations utilisateur - masqué sur mobile très petit */}
        <div className="flex-1 text-left hidden sm:block">
          <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
            {user?.name || user?.role || 'Utilisateur'}
          </p>
          <p className="text-xs sm:text-sm text-orange-600 font-medium leading-tight truncate">
            {user.role}
          </p>
        </div>

        {/* Icône dropdown */}
        <ChevronDownIcon
          className={`w-4 h-4 sm:w-5 sm:h-5 text-orange-500 transition-all duration-300 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu dropdown - design modernisé */}
      {isDropdownOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Menu - design cohérent */}
          <div className="absolute right-0 mt-2 sm:mt-3 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-white/30 z-20">
            {/* En-tête du menu */}
            <div className="px-6 py-5 border-b border-orange-200/30">
              <div className="flex items-center space-x-4">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0">
                  {user.avatar && !user.avatar.includes('/default-avatar.jpg') ? (
                    <Image
                      src={getAvatarUrl(user.avatar)}
                      alt={`Photo de ${user.name}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 sm:border-3 border-orange-200 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-base sm:text-lg lg:text-xl">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.role?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-green-400 border-2 sm:border-3 border-white rounded-full animate-pulse shadow-sm"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {user?.name || user?.role || 'Utilisateur'}
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600 font-medium truncate">
                    {user.role}
                  </p>
                  {user.email && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Options du menu */}
            <div className="py-3">
              <button
                onClick={handleProfile}
                className="w-full flex items-center space-x-4 px-6 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-green-50/50 hover:text-orange-700 transition-all duration-200 rounded-xl mx-2"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <UserCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">Profil</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 px-6 py-3.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 to-red-100 hover:text-red-700 transition-all duration-200 rounded-xl mx-2"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-400 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <ArrowRightOnRectangleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">Se déconnecter</span>
              </button>

              {/* Toggle de mode nuit */}
              {/* <div className="px-6 py-3 border-t border-gray-200/30 dark:border-gray-700/30">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {mounted && theme === 'dark' ? (
                        <MoonIcon className="w-3 h-3" />
                      ) : (
                        <SunIcon className="w-3 h-3" />
                      )}
                    </div>
                    <span className="font-medium">
                      {mounted && theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
                    </span>
                  </div>
                  <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-orange-500 justify-end'
                      : 'bg-gray-300 justify-start'
                  }`}>
                    <div className="w-3 h-3 bg-white rounded-full transition-all duration-300"></div>
                  </div>
                </button>
              </div> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
