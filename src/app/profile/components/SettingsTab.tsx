'use client';
import { useState } from 'react';
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface SettingsTabProps {
  refreshError?: string | null;
  onRefresh?: () => void;
}

export const SettingsTab = ({ refreshError, onRefresh }: SettingsTabProps) => {
  const [settings, setSettings] = useState({
    language: 'fr',
    theme: 'light',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    autoSave: true,
    showTutorial: false,
    dataRetention: '30'
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres généraux</h2>
        <p className="text-gray-600">Personnalisez votre expérience sur la plateforme</p>
      </div>

      <div className="space-y-8">
        {/* Préférences d'affichage */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <EyeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Préférences d'affichage</h3>
              <p className="text-sm text-gray-600">Personnalisez l'apparence de votre interface</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format de date</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Préférences de fonctionnement */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Cog6ToothIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Préférences de fonctionnement</h3>
              <p className="text-sm text-gray-600">Configurez le comportement de l'application</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cog6ToothIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Sauvegarde automatique</p>
                  <p className="text-sm text-gray-500">Sauvegarde automatique des modifications</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <EyeSlashIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Mode incognito</p>
                  <p className="text-sm text-gray-500">Masquer les informations sensibles par défaut</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('showTutorial', !settings.showTutorial)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showTutorial ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showTutorial ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Gestion des données */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <GlobeAltIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestion des données</h3>
              <p className="text-sm text-gray-600">Contrôlez la conservation de vos données</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conservation des données</label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="7">7 jours</option>
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
                <option value="365">1 an</option>
                <option value="forever">Indéfiniment</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">Durée de conservation de vos données d'activité</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Exporter mes données
              </button>
            </div>
          </div>
        </div>

        {/* Zone dangereuse */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-4">
              <TrashIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Zone dangereuse</h3>
              <p className="text-sm text-red-700">Actions irréversibles - Soyez prudent</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-900">Supprimer le compte</p>
                <p className="text-sm text-red-700">Cette action est permanente et ne peut pas être annulée</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer le compte
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-900 font-medium">
                Êtes-vous absolument sûr ? Cette action ne peut pas être annulée.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Confirmer la suppression
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};