'use client';

interface MeetingNotStartedStepProps {
  onBackToHome: () => void;
  meetingName?: string;
}

export default function MeetingNotStartedStep({
  onBackToHome,
  meetingName
}: MeetingNotStartedStepProps) {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Réunion pas encore démarrée</h2>
        <p className="text-gray-600 mb-4">
          {meetingName ? `La réunion "${meetingName}"` : 'Cette réunion'} n&apos;a pas encore démarré.
        </p>
        <p className="text-sm text-gray-500">
          Veuillez revenir lorsque la réunion sera active.
        </p>
      </div>
      <button
        onClick={onBackToHome}
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
      >
        Retour à l&apos;accueil
      </button>
    </div>
  );
}