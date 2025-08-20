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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center sticky top-8 relative overflow-hidden">
      {/* Accent orange en arrière-plan */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-orange-500 to-orange-400"></div>
      
      <div className="relative z-10">
        <div className="relative inline-block mb-6 mt-4">
          <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
            {user.avatar && !user.avatar.includes('/default-avatar.jpg') ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <UserCircleIcon className="w-20 h-20 text-white" />
              </div>
            )}
          </div>
          {onAvatarEdit && (
            <button 
              onClick={onAvatarEdit}
              className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 rounded-full p-2 shadow-lg border-2 border-white transition-colors"
            >
              <CameraIcon className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
        <p className="text-orange-600 font-medium mb-1">{user.role}</p>
        <p className="text-gray-500 text-sm mb-6">{user.department}</p>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 px-3 bg-orange-50 border border-orange-100 rounded-lg">
            <span className="text-gray-600">Membre depuis</span>
            <span className="font-medium text-orange-700">{user.joinedDate}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Dernière connexion</span>
            <span className="font-medium text-gray-900">Il y a {user.lastLogin}</span>
          </div>
        </div>

        {/* Navigation Tabs avec accent orange */}
        <nav className="mt-8 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};