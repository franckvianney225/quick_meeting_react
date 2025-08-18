import { ParticipantForm } from './components/ParticipantForm';

export default function ParticipantFormPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24 pt-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Formulaire Participant</h1>
        <ParticipantForm />
      </div>
    </main>
  );
}