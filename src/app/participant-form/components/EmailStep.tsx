'use client';
import type { EmailStepProps } from './types';

export default function EmailStep({
  email,
  onChange,
  onNext,
  onBack
}: EmailStepProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) onNext();
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
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
          >
            Retour
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Suivant
          </button>
        </div>
      </form>
    </div>
  );
}