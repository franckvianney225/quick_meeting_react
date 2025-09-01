'use client';
import { useState } from 'react';
import {
  InformationCircleIcon,
  CodeBracketIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const CreditsSection = () => {
  const [activeTab, setActiveTab] = useState('technologies');

  return (
    <div className="space-y-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <InformationCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crédits & Informations</h2>
            <p className="text-gray-600">Technologies utilisées et contributeurs du projet</p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'technologies', label: 'Technologies', icon: CodeBracketIcon },
            { id: 'team', label: 'Équipe', icon: UserGroupIcon },
            { id: 'project', label: 'Projet', icon: CogIcon },
            // { id: 'stats', label: 'Statistiques', icon: ChartBarIcon }
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
          {/* Onglet Technologies */}
          {activeTab === 'technologies' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technologies Frontend */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CodeBracketIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Frontend
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Next.js', version: '14+', color: 'black', letter: 'N' },
                      { name: 'React', version: '18+', color: 'blue-600', letter: 'R' },
                      { name: 'TypeScript', version: '5+', color: 'cyan-500', letter: 'T' },
                      { name: 'Tailwind CSS', version: '3+', color: 'blue-500', letter: 'T' }
                    ].map((tech, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-${tech.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">{tech.letter}</span>
                          </div>
                          <span className="font-medium">{tech.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{tech.version}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies Backend */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CogIcon className="w-5 h-5 mr-2 text-green-500" />
                    Backend
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Node.js', version: '18+', color: 'green-600', letter: 'N' },
                      { name: 'NestJS', version: '10+', color: 'red-500', letter: 'N' },
                      { name: 'PostgreSQL', version: '15+', color: 'blue-700', letter: 'P' },
                      { name: 'TypeORM', version: '0.3+', color: 'gray-600', letter: 'T' }
                    ].map((tech, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-${tech.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">{tech.letter}</span>
                          </div>
                          <span className="font-medium">{tech.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{tech.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Équipe */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipe de Développement</h3>
                  
                  <div className="space-y-4">
                    {[
                      { initials: 'MTND', name: 'Ministère de la Transition Numérique et de la Digitalisation', role: 'Équipe de développement', color: 'from-indigo-400 to-purple-500' },
                      { initials: 'DSI', name: 'Direction des Systèmes d’Information', role: 'Architecture & Infrastructure', color: 'from-green-400 to-blue-500' },
                      { initials: 'SDD', name: 'Sous-Direction Développement', role: 'Conception et réalisation du projet', color: 'from-orange-400 to-red-500' },
                      { initials: 'SDR', name: 'Sous-Direction Réseaux', role: 'Mise en place de l’architecture d’hébergement', color: 'from-pink-400 to-rose-500' },
                      { initials: 'SDS', name: 'Sous-Direction Support', role: 'Expérience utilisateur et proposition UI/UX', color: 'from-green-400 to-green-500' }
                    ].map((member, index) => (
                      <div key={index} className={`p-4 bg-gradient-to-r ${member.color} rounded-xl text-white`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="font-semibold">{member.initials}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{member.name}</h4>
                            <p className="text-sm opacity-90">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Partenaires</h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'DTDA', role: 'Soutien institutionnel' },
                      { name: 'Tech Foundation', role: 'Support technique' },
                      { name: 'Open Source Community', role: 'Contributions' }
                    ].map((partner, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                        <p className="text-sm text-gray-600">{partner.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Projet */}
          {activeTab === 'project' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du Projet</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Nom', value: 'QuickMeeting', icon: '🚀' },
                      { label: 'Version', value: '1.0.0', icon: '🏷️' },
                      { label: 'Environnement', value: 'Production', icon: '🌐' },
                      { label: 'Statut', value: 'Actif', icon: '✅' },
                      { label: 'Dernière mise à jour', value: new Date().toLocaleDateString('fr-FR'), icon: '📅' }
                    ].map((info, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{info.icon}</span>
                          <span className="font-medium text-gray-700">{info.label}</span>
                        </div>
                        <span className="text-gray-900 font-semibold">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques</h3>
                  
                  <div className="space-y-3">
                    {[
                      '✅ Gestion des réunions en temps réel',
                      '✅ QR Codes personnalisables',
                      '✅ Liste de présence automatique',
                      '✅ Interface responsive',
                      '✅ Sécurité renforcée',
                      '✅ Export PDF des participants',
                      '✅ Multi-langues supportées',
                      '✅ Thème sombre/clair'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Statistiques */}
          {/* {activeTab === 'stats' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Statistiques en cours de développement</p>
              <p className="text-gray-400 text-sm mt-2">
                Cette fonctionnalité sera disponible prochainement
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
