'use client';
import type { FormStepProps, FormData } from './types';

export default function FormStep({
  formData,
  onChange,
  onNext,
  onBack
}: FormStepProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 mb-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium mb-1">
              Prénom
            </label>
            <input
              type="text"
              id="prenom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="fonction" className="block text-sm font-medium mb-1">
              Fonction
            </label>
            <input
              type="text"
              id="fonction"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="organisation" className="block text-sm font-medium mb-1">
              Organisation
            </label>
            <input
              type="text"
              id="organisation"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
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