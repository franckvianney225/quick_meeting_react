'use client';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface User {
  name: string;
  email: string;
  phone: string;
  department: string;
  position?: string; // Nouveau champ "poste"
}

interface ProfileFormProps {
  user: User;
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileForm = ({ user, isEditing, onInputChange, onEdit, onSave, onCancel }: ProfileFormProps) => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations personnelles</h2>
          <p className="text-gray-600">Gérez vos informations de profil</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button 
                onClick={onCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Annuler</span>
              </button>
              <button 
                onClick={onSave}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </>
          ) : (
            <button 
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nom complet */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Nom complet</label>
          <div className="relative">
            <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            ) : (
              <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user.name}
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Adresse email</label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            ) : (
              <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Numéro de téléphone</label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={user.phone}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            ) : (
              <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user.phone}
              </div>
            )}
          </div>
        </div>

        {/* Département */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Département</label>
          <div className="relative">
            <Cog6ToothIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={user.department}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            ) : (
              <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user.department}
              </div>
            )}
          </div>
        </div>

        {/* Poste */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Poste</label>
          <div className="relative">
            <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isEditing ? (
              <input
                type="text"
                name="position"
                value={user.position || ''}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Votre poste/fonction"
              />
            ) : (
              <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user.position || 'Non spécifié'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};