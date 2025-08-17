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
      {/* Bouton principal - taille augmentée */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[200px]"
      >
        {/* Avatar - taille augmentée */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={`Photo de ${user.name}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Indicateur de statut en ligne */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        {/* Informations utilisateur - toujours visibles avec plus d'espace */}
        <div className="flex-1 text-left">
          <p className="text-base font-semibold text-gray-900 leading-tight">
            {user.name}
          </p>
          <p className="text-sm text-gray-600 leading-tight">
            {user.role}
          </p>
        </div>

        {/* Icône dropdown */}
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Menu dropdown - taille augmentée pour correspondre */}
      {isDropdownOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Menu - largeur augmentée */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
            {/* En-tête du menu - plus spacieux */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`Photo de ${user.name}`}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
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

            {/* Options du menu - plus spacieuses */}
            <div className="py-2">
              <button
                onClick={handleProfile}
                className="w-full flex items-center space-x-4 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCircleIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Profil</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
                <span className="font-medium">Se déconnecter</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
