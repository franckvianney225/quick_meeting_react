'use client';
import { useState } from 'react';
import { 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ServerIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface SMTPConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
  timeout?: number;
  max_retries?: number;
}

interface EmailSectionProps {
  config: SMTPConfig;
  setConfig: (config: SMTPConfig) => void;
}

export const EmailSection = ({ config, setConfig }: EmailSectionProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');

  // Configuration par défaut pour les fournisseurs populaires
  const smtpProviders = [
    {
      name: 'Gmail',
      server: 'smtp.gmail.com',
      port: 587,
      encryption: 'tls' as const,
      info: 'Utilisez un mot de passe d\'application'
    },
    {
      name: 'Outlook/Hotmail',
      server: 'smtp-mail.outlook.com',
      port: 587,
      encryption: 'tls' as const,
      info: 'Authentification moderne requise'
    },
    {
      name: 'Yahoo',
      server: 'smtp.mail.yahoo.com',
      port: 587,
      encryption: 'tls' as const,
      info: 'Mot de passe d\'application requis'
    },
    {
      name: 'Serveur personnalisé',
      server: '',
      port: 587,
      encryption: 'tls' as const,
      info: 'Configuration manuelle'
    }
  ];

  const handleProviderSelect = (provider: typeof smtpProviders[0]) => {
    if (provider.server) {
      setConfig({
        ...config,
        server: provider.server,
        port: provider.port,
        encryption: provider.encryption
      });
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    
    // Simulation du test de connexion
    setTimeout(() => {
      if (config.server && config.username && config.password) {
        setTestStatus('success');
        setTestMessage('Connexion SMTP établie avec succès');
        setConnectionStatus('connected');
      } else {
        setTestStatus('error');
        setTestMessage('Veuillez remplir tous les champs obligatoires');
        setConnectionStatus('failed');
      }
    }, 2000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setTestMessage('Veuillez saisir une adresse email de test');
      return;
    }

    setTestStatus('testing');
    
    // Simulation de l'envoi d'email
    setTimeout(() => {
      setTestStatus('success');
      setTestMessage(`Email de test envoyé avec succès à ${testEmail}`);
    }, 3000);
  };

  const getPortInfo = (port: number) => {
    switch (port) {
      case 25: return { text: 'Port standard (non sécurisé)', color: 'text-red-600' };
      case 587: return { text: 'Port recommandé pour STARTTLS', color: 'text-green-600' };
      case 465: return { text: 'Port SSL/TLS', color: 'text-blue-600' };
      default: return { text: 'Port personnalisé', color: 'text-gray-600' };
    }
  };

  const portInfo = getPortInfo(config.port);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <EnvelopeIcon className="w-6 h-6 mr-2 text-orange-600" />
          Configuration Email (SMTP)
        </h2>
        <p className="text-gray-600">Configurez les paramètres d&apos;envoi d&apos;emails pour votre organisation</p>
      </div>

      <div className="space-y-8">
        {/* Statut de connexion */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ServerIcon className="w-5 h-5 mr-2 text-orange-600" />
              Statut de la connexion
            </h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {connectionStatus === 'connected' ? <CheckCircleIcon className="w-4 h-4" /> :
               connectionStatus === 'failed' ? <XCircleIcon className="w-4 h-4" /> :
               <InformationCircleIcon className="w-4 h-4" />}
              <span>
                {connectionStatus === 'connected' ? 'Connecté' :
                 connectionStatus === 'failed' ? 'Échec' :
                 'Non testé'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CogIcon className={`w-4 h-4 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>{testStatus === 'testing' ? 'Test en cours...' : 'Tester la connexion'}</span>
          </button>
        </div>

        {/* Fournisseurs prédéfinis */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fournisseurs populaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {smtpProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleProviderSelect(provider)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-orange-300 hover:bg-orange-50 ${
                  config.server === provider.server ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900">{provider.name}</div>
                <div className="text-xs text-gray-500 mt-1">{provider.info}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration SMTP */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <CogIcon className="w-5 h-5 mr-2 text-orange-600" />
            Paramètres SMTP
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Serveur SMTP *
                </label>
                <div className="relative">
                  <ServerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={config.server}
                    onChange={(e) => setConfig({...config, server: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Port *
                </label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({...config, port: parseInt(e.target.value) || 587})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="587"
                />
                <p className={`mt-1 text-xs ${portInfo.color}`}>
                  {portInfo.text}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom d&apos;utilisateur *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => setConfig({...config, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="votre-email@gmail.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={config.password}
                    onChange={(e) => setConfig({...config, password: e.target.value})}
                    className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? 
                      <EyeSlashIcon className="h-5 w-5" /> : 
                      <EyeIcon className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chiffrement *
                </label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={config.encryption}
                    onChange={(e) => setConfig({...config, encryption: e.target.value as 'none' | 'tls' | 'ssl'})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
                  >
                    <option value="none">Aucun (non recommandé)</option>
                    <option value="tls">TLS/STARTTLS (recommandé)</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email expéditeur *
                </label>
                <input
                  type="email"
                  value={config.from_email}
                  onChange={(e) => setConfig({...config, from_email: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="noreply@ministere.gouv.ci"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom expéditeur *
                </label>
                <input
                  type="text"
                  value={config.from_name}
                  onChange={(e) => setConfig({...config, from_name: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ministère des Télécommunications"
                />
              </div>

              {/* Paramètres avancés */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Paramètres avancés</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Timeout (secondes)
                    </label>
                    <input
                      type="number"
                      value={config.timeout || 30}
                      onChange={(e) => setConfig({...config, timeout: parseInt(e.target.value) || 30})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      min="10"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tentatives max
                    </label>
                    <input
                      type="number"
                      value={config.max_retries || 3}
                      onChange={(e) => setConfig({...config, max_retries: parseInt(e.target.value) || 3})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test d'envoi d'email */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PaperAirplaneIcon className="w-5 h-5 mr-2 text-orange-600" />
            Test d&apos;envoi d&apos;email
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Envoyez un email de test pour vérifier que la configuration fonctionne correctement
          </p>
          
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="test@example.com"
              />
            </div>
            <button
              onClick={handleSendTestEmail}
              disabled={testStatus === 'testing' || !testEmail}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{testStatus === 'testing' ? 'Envoi...' : 'Envoyer test'}</span>
            </button>
          </div>

          {/* Message de statut */}
          {testMessage && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
              testStatus === 'success' ? 'bg-green-100 text-green-800' : 
              testStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {testStatus === 'success' ? <CheckCircleIcon className="w-5 h-5" /> :
               testStatus === 'error' ? <XCircleIcon className="w-5 h-5" /> :
               <InformationCircleIcon className="w-5 h-5" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Informations de sécurité */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2">Conseils de sécurité</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Utilisez toujours TLS/SSL pour sécuriser les connexions</li>
                <li>• Pour Gmail, utilisez un mot de passe d&apos;application au lieu de votre mot de passe principal</li>
                <li>• Vérifiez que votre serveur SMTP accepte les connexions externes</li>
                <li>• Testez régulièrement votre configuration pour vous assurer qu&apos;elle fonctionne</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          * Champs obligatoires
        </div>
        <div className="flex space-x-3">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Réinitialiser
          </button>
          <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Enregistrer la configuration
          </button>
        </div>
      </div>
    </div>
  );
};
