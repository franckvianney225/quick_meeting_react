'use client';

interface AlreadyRegisteredStepProps {
  email: string;
  meetingName?: string;
  onBackToHome: () => void;
}

export default function AlreadyRegisteredStep({
  email,
  meetingName,
  onBackToHome
}: AlreadyRegisteredStepProps) {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Déjà inscrit</h2>
        <p className="text-gray-600 mb-4">
          L'adresse email <strong>{email}</strong> est déjà inscrite 
          {meetingName ? ` à la réunion "${meetingName}"` : ' à cette réunion'}.
        </p>
        <p className="text-sm text-gray-500">
          Vous ne pouvez pas vous inscrire deux fois à la même réunion.
        </p>
      </div>
      <button
        onClick={onBackToHome}
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}