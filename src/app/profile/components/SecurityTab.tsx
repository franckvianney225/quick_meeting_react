'use client';
import { useState } from 'react';
import {
  KeyIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface SecurityTabProps {
  refreshError?: string | null;
  onRefresh?: () => void;
}

export const SecurityTab = ({ refreshError, onRefresh }: SecurityTabProps) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-8">
      {refreshError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{refreshError}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sécurité du compte</h2>
        <p className="text-gray-600">Protégez votre compte avec des paramètres de sécurité avancés</p>
      </div>

      <div className="space-y-8">
        {/* Changer mot de passe avec accent orange */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <KeyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
              <p className="text-sm text-gray-600">Mettez à jour votre mot de passe régulièrement</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Mettre à jour le mot de passe
          </button>
        </div>

        {/* Authentification 2FA */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Non activée</span>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Activer
              </button>
            </div>
          </div>
        </div>

        {/* Sessions actives */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <ComputerDesktopIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sessions actives</h3>
              <p className="text-sm text-gray-600">Gérez vos appareils connectés</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center">
                <ComputerDesktopIcon className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Chrome sur Windows</p>
                  <p className="text-sm text-gray-500">Paris, France • Session actuelle</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Actif</span>
            </div>
            
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Safari sur iPhone</p>
                  <p className="text-sm text-gray-500">Paris, France • Il y a 2 heures</p>
                </div>
              </div>
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">Déconnecter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};