'use client';

export const CreditsSection = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crédits & Informations</h2>
            <p className="text-gray-600">Informations sur les technologies utilisées et les contributeurs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Technologies utilisées */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Technologies
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                  <span className="font-medium">Next.js</span>
                </div>
                <span className="text-sm text-gray-500">v14+</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="font-medium">React</span>
                </div>
                <span className="text-sm text-gray-500">v18+</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="font-medium">TypeScript</span>
                </div>
                <span className="text-sm text-gray-500">v5+</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="font-medium">Tailwind CSS</span>
                </div>
                <span className="text-sm text-gray-500">v3+</span>
              </div>
            </div>
          </div>

          {/* Contributeurs */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Équipe de Développement
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">MD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ministère Digital</h4>
                    <p className="text-sm text-gray-600">Équipe de développement</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">DT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Direction Technique</h4>
                    <p className="text-sm text-gray-600">Architecture & Infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du Projet</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environnement</span>
                <span className="font-medium text-green-600">Production</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Dernière mise à jour</span>
                <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className="font-medium text-green-600">Actif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec logo */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg"></div>
            <span className="text-lg font-bold text-gray-900">QuickMeeting</span>
          </div>
          <p className="text-gray-600 text-sm">
            Solution de gestion de réunions gouvernementales
          </p>
        </div>
      </div>
    </div>
  );
};