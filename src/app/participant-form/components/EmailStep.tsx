'use client';
import { useState } from 'react';
import type { EmailStepProps } from './types';
import { apiUrl } from '@/lib/api';

export default function EmailStep({
  email,
  onChange,
  onNext,
  onBack
}: EmailStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      // D'abord vérifier si l'email est déjà inscrit à cette réunion
      const searchParams = new URLSearchParams(window.location.search);
      const meetingCode = searchParams.get('code');
      
      if (meetingCode) {
        const checkResponse = await fetch(apiUrl(`/participants/check-registration?email=${encodeURIComponent(email)}&meetingCode=${meetingCode}`), {
          credentials: 'include'
        });

        if (checkResponse.ok) {
          const result = await checkResponse.json();
          if (result.isRegistered) {
            if (result.participant) {
              // Le participant est déjà inscrit et on a ses informations
              onNext(result.participant, true);
            } else {
              // Le participant est déjà inscrit mais on n'a pas ses informations
              onNext(undefined, true);
            }
            return;
          }
        }
      }

      // Ensuite vérifier si l'email existe déjà dans la base de données (pour pré-remplissage)
      const response = await fetch(apiUrl(`/participants/search?email=${encodeURIComponent(email)}`), {
        credentials: 'include'
      });

      if (response.ok) {
        const existingParticipants = await response.json();
        if (existingParticipants.length > 0) {
          // Transmettre les informations du participant existant
          onNext(existingParticipants[0], false);
          return;
        }
      }
      
      // Si aucun participant trouvé, continuer normalement
      onNext(undefined, false);
    } catch (err) {
      console.error('Erreur lors de la vérification email:', err);
      setError('Erreur lors de la vérification de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Votre adresse email</h2>
        <p className="text-gray-600 text-sm">
          Entrez votre email pour continuer l&apos;inscription
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="votre@email.com"
            required
          />
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-500 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vérification en cours...
            </div>
          ) : (
            'Continuer'
          )}
        </button>
      </form>
    </div>
  );
}