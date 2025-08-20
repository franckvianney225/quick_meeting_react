'use client';
import {
  UserCircleIcon,
  LockClosedIcon,
  BellIcon,
  Cog6ToothIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

interface User {
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  joinedDate: string;
  lastLogin: string;
  civility?: string;
}

interface ProfileSidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAvatarEdit?: () => void;
}

const tabs = [
  { id: 'profile', label: 'Profil', icon: UserCircleIcon },
  { id: 'security', label: 'Sécurité', icon: LockClosedIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'settings', label: 'Paramètres', icon: Cog6ToothIcon },
];

export const ProfileSidebar = ({ user, activeTab, onTabChange, onAvatarEdit }: ProfileSidebarProps) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center sticky top-4 relative overflow-hidden">
      {/* Accent coloré en arrière-plan */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-orange-500 via-orange-600 to-green-600"></div>

      <div className="relative z-10">
        <div className="relative inline-block mb-6 mt-6">
          <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            {user.avatar && !user.avatar.includes('/default-avatar.jpg') ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 flex items-center justify-center">
                <UserCircleIcon className="w-20 h-20 text-white" />
              </div>
            )}
          </div>
          {onAvatarEdit && (
            <button
              onClick={onAvatarEdit}
              className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 rounded-full p-3 shadow-lg border-2 border-white transition-all duration-300 hover:scale-110"
            >
              <CameraIcon className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {user.civility && (
          <p className="text-gray-600 text-sm mb-2 font-medium">{user.civility}</p>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{user.name}</h2>
        <p className="text-orange-600 font-semibold mb-1">{user.role}</p>
        <p className="text-gray-500 text-sm mb-6">{user.department}</p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-orange-50/80 to-green-50/80 border border-orange-200/50 rounded-xl backdrop-blur-sm">
            <span className="text-gray-600 font-medium">Membre depuis</span>
            <span className="font-semibold text-orange-700">{user.joinedDate}</span>
          </div>
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl">
            <span className="text-gray-600 font-medium">Dernière connexion</span>
            <span className="font-semibold text-gray-900">Il y a {user.lastLogin}</span>
          </div>
        </div>

        {/* Navigation Tabs avec accent coloré */}
        <nav className="mt-8 space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-50 to-green-50 text-orange-700 border border-orange-200 shadow-md'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-green-50/50 hover:text-gray-900 border border-transparent hover:border-orange-200/50'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-all duration-300 ${
                  isActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-500'
                }`} />
                <span className="font-medium text-sm">{tab.label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-green-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};