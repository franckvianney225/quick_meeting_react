'use client';
import { useState } from 'react';
import {
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface NotificationsTabProps {
  refreshError?: string | null;
  onRefresh?: () => void;
}

export const NotificationsTab = ({ refreshError, onRefresh }: NotificationsTabProps) => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    meetingReminders: true,
    newMessages: true,
    weeklyDigest: false,
    securityAlerts: true
  });

  const handleSettingChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Préférences de notifications</h2>
        <p className="text-gray-600">Contrôlez comment et quand vous recevez des notifications</p>
      </div>

      <div className="space-y-6">
        {/* Paramètres généraux */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <BellIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres généraux</h3>
              <p className="text-sm text-gray-600">Gérez vos préférences de notification globales</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-500">Recevez des emails pour les mises à jour importantes</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.emailNotifications ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BellIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notifications push</p>
                  <p className="text-sm text-gray-500">Recevez des notifications sur votre appareil</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('pushNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.pushNotifications ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Types de notifications */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Types de notifications</h3>
              <p className="text-sm text-gray-600">Choisissez les types de notifications que vous souhaitez recevoir</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Rappels de réunions</p>
                  <p className="text-sm text-gray-500">Rappels avant le début des réunions</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('meetingReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.meetingReminders ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.meetingReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Nouveaux messages</p>
                  <p className="text-sm text-gray-500">Notifications pour les nouveaux messages</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('newMessages')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.newMessages ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.newMessages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Résumé hebdomadaire</p>
                  <p className="text-sm text-gray-500">Résumé de vos activités de la semaine</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('weeklyDigest')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.weeklyDigest ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alertes de sécurité</p>
                  <p className="text-sm text-gray-500">Notifications importantes concernant la sécurité</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('securityAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.securityAlerts ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Fréquence des notifications */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <BellIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Fréquence des notifications</h3>
              <p className="text-sm text-gray-600">Contrôlez la fréquence de vos notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence des emails</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="immediate">Immédiatement</option>
                <option value="daily">Quotidiennement</option>
                <option value="weekly">Hebdomadairement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heures silencieuses</label>
              <div className="grid grid-cols-2 gap-4">
                <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                  <option value="00:00">00:00</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="06:00">06:00</option>
                  <option value="07:00">07:00</option>
                  <option value="08:00">08:00</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-2">Aucune notification ne sera envoyée pendant ces heures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};