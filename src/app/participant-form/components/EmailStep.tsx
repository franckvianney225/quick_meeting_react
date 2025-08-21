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
      // Vérifier si l'email existe déjà dans la base de données
      const response = await fetch(apiUrl(`/participants/search?email=${encodeURIComponent(email)}`), {
        credentials: 'include'
      });

      if (response.ok) {
        const existingParticipants = await response.json();
        if (existingParticipants.length > 0) {
          // Transmettre les informations du participant existant
          onNext(existingParticipants[0]);
          return;
        }
      }
      
      // Si aucun participant trouvé, continuer normalement
      onNext();
    } catch (err) {
      console.error('Erreur lors de la vérification email:', err);
      setError('Erreur lors de la vérification de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Votre email</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Vérification...' : 'Suivant'}
          </button>
        </div>
      </form>
    </div>
  );
}