'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domainError, setDomainError] = useState('');
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const router = useRouter();
  const { login } = useAuth();

  // Récupérer les domaines autorisés
  const fetchAllowedDomains = async () => {
    try {
      const response = await fetch('http://localhost:3001/organization/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const settings = await response.json();
        setAllowedDomains(settings.allowed_email_domains || []);
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

  // Charger les domaines autorisés au montage du composant
  useEffect(() => {
    fetchAllowedDomains();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">QM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Meeting</h1>
          <p className="text-gray-600">Connexion à l&apos;espace d&apos;administration</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="admin@ministere.gov"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 font-medium">Erreur</div>
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Informations de test */}
        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Compte de test :</h4>
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
            className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-xs"
          >
            🔄 Nettoyer le cache d'authentification
          </button>
        </div>
      </div>
    </div>
  );
}