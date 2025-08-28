'use client';
import { useState } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export const SecuritySection = () => {
  const [activeTab, setActiveTab] = useState('authentication');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sécurité</h2>
            <p className="text-gray-600">Gérez la sécurité de votre compte</p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'sessions', label: 'Sessions', icon: ClockIcon },
            { id: 'activity', label: 'Activité', icon: DocumentTextIcon },
            { id: 'notifications', label: 'Alertes', icon: BellIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {/* Placeholder pour tous les onglets */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Section en cours de développement</p>
            <p className="text-gray-400 text-sm mt-2">
              Cette fonctionnalité sera disponible prochainement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};