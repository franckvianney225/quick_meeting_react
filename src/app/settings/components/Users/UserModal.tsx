'use client';
import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; error?: string }>;
  editingUser?: User | null;
}

export const UserModal = ({ isOpen, onClose, onSave, editingUser }: UserModalProps) => {
  const [formData, setFormData] = useState({
    name: editingUser?.name || '',
    email: editingUser?.email || '',
    role: editingUser?.role || 'Utilisateur',
    status: editingUser?.status || 'active' as 'active' | 'inactive'
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);

  // Charger les domaines email autorisés
  useEffect(() => {
    const fetchAllowedDomains = async () => {
      try {
        const response = await fetch(apiUrl('/organization/settings'), {
          headers: AuthService.getAuthHeaders()
        });
        if (response.ok) {
          const settings = await response.json();
          setAllowedDomains(settings.allowedEmailDomains || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des domaines autorisés:', error);
      }
    };

    if (isOpen) {
      fetchAllowedDomains();
    }
  }, [isOpen]);

  // Mettre à jour le formulaire quand l'utilisateur en édition change
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'Utilisateur',
        status: editingUser.status || 'active'
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setFormData({
        name: '',
        email: '',
        role: 'Utilisateur',
        status: 'active'
      });
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (allowedDomains.length > 0) {
      const userEmail = formData.email.toLowerCase();
      const isDomainAllowed = allowedDomains.some(domain => {
        const domainPattern = domain.startsWith('@') ? domain.toLowerCase() : `@${domain.toLowerCase()}`;
        return userEmail.endsWith(domainPattern);
      });

      if (!isDomainAllowed) {
        newErrors.email = 'Le domaine email n\'est pas autorisé pour la création de compte';
      }
    }
    
    // Le mot de passe n'est plus requis pour la création
    // L'utilisateur recevra un email d'invitation pour définir son mot de passe
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await onSave(formData);
      
      if (result && !result.success) {
        // Gérer les erreurs spécifiques
        if (result.error && result.error.includes('domaine email n\'est pas autorisé')) {
          setErrors(prev => ({ ...prev, email: result.error || 'Erreur de domaine email' }));
        } else if (result.error) {
          // Pour les autres erreurs, on pourrait afficher un message général
          console.error('Erreur lors de la sauvegarde:', result.error);
        }
      } else {
        // Succès - fermer le modal
        handleClose();
      }
    } catch (error) {
      // Gestion des erreurs pour la compatibilité avec l'ancien format
      if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
        setErrors(prev => ({ ...prev, email: error.message }));
      } else {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Utilisateur',
      status: 'active'
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay avec flou */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 border border-white/20">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingUser ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nom complet */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Jean Dupont"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="jean@ministere.gov"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>


              {/* Rôle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rôle *
                </label>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                  >
                    <option value="Utilisateur">Utilisateur</option>
                    <option value="Admin">Administrateur</option>
                  </select>
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut *
                </label>
                <div className="relative">
                  <CheckCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informations sur les rôles */}
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions par rôle :</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div><strong>Utilisateur :</strong> Peut créer et gérer ses propres réunions uniquement</div>
                <div><strong>Administrateur :</strong> Accès complet au système, gestion de tous les utilisateurs et paramètres</div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                {editingUser ? 'Mettre à jour' : "Envoyer l&apos;invitation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
