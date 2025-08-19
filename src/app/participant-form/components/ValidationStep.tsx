'use client';

import type { ValidationStepProps } from './types';

export default function ValidationStep({
  firstName,
  lastName,
  onBack
}: ValidationStepProps) {
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-green-600">Validation réussie !</h2>
      
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg text-gray-800 mb-2">
          Merci <strong>{fullName}</strong> d&apos;avoir signé !
        </p>
        <p className="text-sm text-gray-600">
          Votre formulaire a été soumis avec succès.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}