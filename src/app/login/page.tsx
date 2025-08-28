'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { apiUrl } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domainError, setDomainError] = useState('');
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [organizationName, setOrganizationName] = useState('Ministère');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  // Récupérer le nom de l'organisation (endpoint public)
  const fetchOrganizationName = async () => {
    try {
      const response = await fetch(apiUrl('/organization/public/name'));
      
      if (response.ok) {
        const data = await response.json();
        setOrganizationName(data.name || 'Ministère');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du nom de l\'organisation:', err);
    }
  };

  // Récupérer les domaines autorisés (nécessite un token)
  const fetchAllowedDomains = async () => {
    try {
      const response = await fetch(apiUrl('/organization/settings'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setAllowedDomains(data.allowedEmailDomains || []);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des domaines autorisés:', err);
    }
  };

  // Vérifier si l'email a un domaine autorisé
  const isEmailDomainAllowed = (email: string): boolean => {
    if (allowedDomains.length === 0) return true; // Si aucun domaine n'est configuré, tout est autorisé

    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setDomainError('');

    if (value && allowedDomains.length > 0) {
      if (!isEmailDomainAllowed(value)) {
        setDomainError('Veuillez vous connecter avec votre compte professionnel');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDomainError('');

    // Vérifier le domaine avant de tenter la connexion
    if (allowedDomains.length > 0 && !isEmailDomainAllowed(email)) {
      setDomainError('Veuillez vous connecter avec votre compte professionnel');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);

    try {
      const response = await fetch(apiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetMessage({
          type: 'success',
          text: 'Un email de réinitialisation a été envoyé à votre adresse.'
        });
        setResetEmail('');
        setTimeout(() => setIsResetMode(false), 3000);
      } else {
        setResetMessage({
          type: 'error',
          text: data.message || 'Erreur lors de l&apos;envoi de l&apos;email de réinitialisation.'
        });
      }
    } catch (err) {
      setResetMessage({
        type: 'error',
        text: 'Erreur de connexion. Veuillez réessayer.'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Charger le nom de l'organisation au montage du composant
  useEffect(() => {
    fetchOrganizationName();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 flex relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Colonne gauche - Texte de bienvenue */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12 bg-orange-300 text-white relative z-10">
        <div className="relative z-10 max-w-lg">

          <h1 className="text-6xl font-bold mb-8 leading-tight text-white">
            BIENVENUE AU <br />{organizationName.toUpperCase()}
          </h1>

          <p className="text-xl mb-10 text-white leading-relaxed font-light">
            Plateforme moderne de gestion des réunions et suivi des participants pour l&apos;administration publique
          </p>

          <div className="space-y-5">
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-orange-400/30 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-orange-50 font-medium">Gestion centralisée des réunions</span>
            </div>
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-orange-400/30 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-orange-50 font-medium">Suivi des participants en temps réel</span>
            </div>
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-orange-400/30 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h.01M12 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-orange-50 font-medium">Génération automatique de QR codes</span>
            </div>
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-orange-400/30 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-orange-50 font-medium">Rapports et statistiques détaillés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Conteneur de connexion */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/40 hover:shadow-3xl transition-all duration-500">

          {/* Logo et titre */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="text-white font-bold text-xl">QM</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Quick Meeting
            </h2>
            <p className="text-gray-600 text-sm font-medium">Connexion à l&apos;espace d&apos;administration</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative group">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-300/30 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:border-gray-300"
                  placeholder="admin@ministere.gov"
                  required
                />
              </div>
              {domainError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-medium">{domainError}</p>
                </div>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative group">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-300/30 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:border-gray-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200 p-1 hover:bg-orange-50 rounded-lg"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-red-600 font-medium text-sm">Erreur</div>
                </div>
                <div className="text-red-700 text-sm mt-1">{error}</div>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Bouton de réinitialisation de mot de passe */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          {/* Informations de test */}
          <div className="mt-6 p-4 bg-orange-50/60 backdrop-blur-sm border border-orange-200/40 rounded-2xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Compte de test
            </h4>
            <div className="space-y-1 text-xs text-gray-600 mb-3">
              <div><strong>Email:</strong> admin@ministere.gov</div>
              <div><strong>Mot de passe:</strong> admin123</div>
            </div>

            {/* Bouton de nettoyage du localStorage */}
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                alert('LocalStorage nettoyé. Veuillez vous reconnecter.');
                window.location.reload();
              }}
              className="w-full py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 font-medium text-xs border border-red-300/50 hover:border-red-400/50"
            >
              🔄 Nettoyer le cache d&apos;authentification
            </button>
          </div>
        </div>

        {/* Modal de réinitialisation de mot de passe */}
        {isResetMode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Réinitialiser le mot de passe</h3>
                <button
                  onClick={() => {
                    setIsResetMode(false);
                    setResetMessage(null);
                    setResetEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative group">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-300/30 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:border-gray-300"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                {resetMessage && (
                  <div className={`p-3 rounded-2xl border ${
                    resetMessage.type === 'success'
                      ? 'bg-green-50/80 border-green-200'
                      : 'bg-red-50/80 border-red-200'
                  } backdrop-blur-sm animate-in slide-in-from-top-2 duration-300`}>
                    <div className="flex items-center">
                      <svg className={`w-4 h-4 mr-2 ${
                        resetMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                          resetMessage.type === 'success'
                            ? "M5 13l4 4L19 7"
                            : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        } />
                      </svg>
                      <div className={`text-sm font-medium ${
                        resetMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {resetMessage.type === 'success' ? 'Succès' : 'Erreur'}
                      </div>
                    </div>
                    <div className={`text-sm mt-1 ${
                      resetMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {resetMessage.text}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setResetMessage(null);
                      setResetEmail('');
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {resetLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Envoi...
                      </div>
                    ) : (
                      'Envoyer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}