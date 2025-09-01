import { Suspense } from 'react';
import { ParticipantForm } from './components/ParticipantForm';

function ParticipantFormContent() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24 pt-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">Formulaire Participant</h1> */}
        <ParticipantForm />
      </div>
    </main>
  );
}

export default function ParticipantFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ParticipantFormContent />
    </Suspense>
  );
}