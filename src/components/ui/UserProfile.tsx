'use client';
import { useState } from 'react';
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

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
        className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:ring-offset-2 min-w-[220px] shadow-lg hover:shadow-xl border border-white/30"
      >
        {/* Avatar - avec effets */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {user.avatar && !user.avatar.includes('/default-avatar.jpg') ? (
            <Image
              src={user.avatar.includes('http') ? user.avatar : `http://localhost:3001${user.avatar}`}
              alt={`Photo de ${user.name}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-3 border-orange-200 shadow-md hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200">
              <span className="text-white font-semibold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.role?.charAt(0) || 'U'}
              </span>
            </div>
          )}

          {/* Indicateur de statut en ligne */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-3 border-white rounded-full animate-pulse shadow-sm"></div>
        </div>

        {/* Informations utilisateur */}
        <div className="flex-1 text-left">
          <p className="text-base font-bold text-gray-900 leading-tight">
            {user?.name || user?.role || 'Utilisateur'}
          </p>
          <p className="text-sm text-orange-600 font-medium leading-tight">
            {user.role}
          </p>
        </div>

        {/* Icône dropdown */}
        <ChevronDownIcon
          className={`w-5 h-5 text-orange-500 transition-all duration-300 ${
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
          <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-20">
            {/* En-tête du menu */}
            <div className="px-6 py-5 border-b border-orange-200/30">
              <div className="flex items-center space-x-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  {user.avatar && !user.avatar.includes('/default-avatar.jpg') ? (
                    <Image
                      src={user.avatar.includes('http') ? user.avatar : `http://localhost:3001${user.avatar}`}
                      alt={`Photo de ${user.name}`}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover border-3 border-orange-200 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-xl">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.role?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-3 border-white rounded-full animate-pulse shadow-sm"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 truncate">
                    {user?.name || user?.role || 'Utilisateur'}
                  </p>
                  <p className="text-sm text-orange-600 font-medium truncate">
                    {user.role}
                  </p>
                  {user.email && (
                    <p className="text-sm text-gray-500 truncate mt-1">
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
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <UserCircleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Profil</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 px-6 py-3.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 to-red-100 hover:text-red-700 transition-all duration-200 rounded-xl mx-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Se déconnecter</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
