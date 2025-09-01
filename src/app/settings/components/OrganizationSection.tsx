'use client';
import { useState } from 'react';
import {
  BuildingOffice2Icon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

interface OrganizationSettings {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  allowedEmailDomains?: string[];
}

interface OrganizationSectionProps {
  settings: OrganizationSettings;
  setSettings: (settings: OrganizationSettings) => void;
}

export const OrganizationSection = ({ settings, setSettings }: OrganizationSectionProps) => {
  const token = AuthService.getToken();
  const [newDomain, setNewDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<'valid' | 'invalid' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // S'assurer que allowedEmailDomains existe toujours
  const allowedDomains = settings.allowedEmailDomains || [];

  // Validation du format de domaine
  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  // Ajouter un nouveau domaine
  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      setDomainError('Veuillez saisir un domaine');
      return;
    }

    // Ajouter @ au début si pas présent
    const formattedDomain = newDomain.startsWith('@') ? newDomain : `@${newDomain}`;

    if (!validateDomain(formattedDomain)) {
      setDomainError('Format de domaine invalide (ex: @domaine.com)');
      return;
    }

    if (allowedDomains.includes(formattedDomain)) {
      setDomainError('Ce domaine existe déjà');
      return;
    }

    setSettings({
      ...settings,
      allowedEmailDomains: [...allowedDomains, formattedDomain]
    });

    setNewDomain('');
    setDomainError('');
  };

  // Supprimer un domaine
  const handleRemoveDomain = (domainToRemove: string) => {
    setSettings({
      ...settings,
      allowedEmailDomains: allowedDomains.filter(domain => domain !== domainToRemove)
    });
  };

  // Tester un email
  const handleTestEmail = () => {
    if (!testEmail.trim()) {
      setTestResult(null);
      return;
    }

    const isValid = allowedDomains.some(domain => 
      testEmail.toLowerCase().endsWith(domain.toLowerCase())
    );

    setTestResult(isValid ? 'valid' : 'invalid');
  };

  // Sauvegarder les paramètres
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Utiliser PUT pour sauvegarder (gère à la fois création et mise à jour)
      const response = await fetch(apiUrl('/organization'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const savedSettings = await response.json();
        // Mettre à jour l'état avec les données reçues (y compris l'ID si création)
        setSettings(savedSettings);
        setSaveMessage({ type: 'success', message: 'Paramètres sauvegardés avec succès !' });
      } else {
        const errorData = await response.json();
        setSaveMessage({ type: 'error', message: errorData.message || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Erreur de connexion au serveur' });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer l'upload du logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage({ type: 'error', message: 'Le fichier est trop volumineux (max 2MB)' });
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setSaveMessage({ type: 'error', message: 'Seules les images sont acceptées' });
      return;
    }

    // Convertir en base64 pour l'instant (dans un vrai projet, on utiliserait un upload vers un serveur)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSettings({ ...settings, logo: base64 });
      setSaveMessage({ type: 'success', message: 'Logo mis à jour' });
    };
    reader.readAsDataURL(file);
  };

  // Réinitialiser les paramètres
  const handleReset = () => {
    setSettings({
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo: '',
      allowedEmailDomains: []
    });
    setSaveMessage(null);
  };

  // Vider complètement la table
  const handleClearAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUS les paramètres d\'organisation ? Cette action est irréversible.')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(apiUrl('/organization/clear-all'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSettings({
          name: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          logo: '',
          allowedEmailDomains: []
        });
        setSaveMessage({ type: 'success', message: 'Tous les paramètres ont été supprimés avec succès !' });
      } else {
        setSaveMessage({ type: 'error', message: 'Erreur lors de la suppression des paramètres' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Erreur de connexion au serveur' });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres de l&apos;organisation</h2>
        <p className="text-gray-600">Configurez les informations de votre organisation et les domaines email autorisés</p>
      </div>

      <div className="space-y-8">
        {/* Informations générales */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BuildingOffice2Icon className="w-5 h-5 mr-2 text-orange-600" />
            Informations générales
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l&apos;organisation *</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nom de l'organisation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Adresse complète"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Email de contact"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => setSettings({...settings, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Site web"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l&apos;organisation</label>
                <div className="flex items-center space-x-4">
                  {settings.logo ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-orange-300">
                      <img 
                        src={settings.logo} 
                        alt="Logo de l'organisation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center border-2 border-orange-300">
                      <BuildingOffice2Icon className="w-8 h-8 text-orange-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm inline-block"
                    >
                      Changer le logo
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Formats acceptés: PNG, JPG (max 2MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domaines email autorisés */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Domaines email autorisés</h3>
                <p className="text-sm text-gray-600">Définissez les domaines email acceptés pour la création de comptes</p>
              </div>
            </div>
          </div>

          {/* Ajouter un nouveau domaine */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter un nouveau domaine</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    setDomainError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    domainError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="domaine.com ou @domaine.com"
                />
                {domainError && <p className="mt-1 text-sm text-red-600">{domainError}</p>}
              </div>
              <button
                onClick={handleAddDomain}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Domaines suggérés */}


          {/* Liste des domaines configurés */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Domaines configurés ({allowedDomains.length})
            </h4>
            {allowedDomains.length > 0 ? (
              <div className="space-y-2">
                {allowedDomains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-mono text-green-800">{domain}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-colors"
                      title="Supprimer ce domaine"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun domaine configuré</p>
                <p className="text-gray-400 text-xs">Ajoutez au moins un domaine pour sécuriser les inscriptions</p>
              </div>
            )}
          </div>

          {/* Testeur d'email */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Tester un email :</h4>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => {
                    setTestEmail(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="test@domaine.com"
                />
              </div>
              <button
                onClick={handleTestEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tester
              </button>
            </div>
            {testResult && (
              <div className={`mt-2 p-2 rounded flex items-center space-x-2 ${
                testResult === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {testResult === 'valid' ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {testResult === 'valid' 
                    ? 'Email autorisé ✓' 
                    : 'Email refusé - domaine non autorisé ✗'
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages de sauvegarde */}
      {saveMessage && (
        <div className={`p-4 rounded-lg mb-4 ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {saveMessage.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{saveMessage.message}</span>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          * Champs obligatoires
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          {/* <button
            onClick={handleClearAll}
            disabled={isSaving}
            className={`px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Vider la table
          </button> */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
};
