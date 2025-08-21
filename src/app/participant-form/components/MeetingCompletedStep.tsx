'use client';

interface MeetingCompletedStepProps {
  onBackToHome: () => void;
  meetingName?: string;
}

export default function MeetingCompletedStep({
  onBackToHome,
  meetingName
}: MeetingCompletedStepProps) {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Réunion clôturée</h2>
        <p className="text-gray-600 mb-4">
          {meetingName ? `La réunion "${meetingName}"` : 'Cette réunion'} a été clôturée.
        </p>
        <p className="text-sm text-gray-500">
          Désolé, mais vous ne pouvez pas signer car la réunion a été clôturée.
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