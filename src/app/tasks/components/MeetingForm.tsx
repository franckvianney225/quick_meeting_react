'use client';
import { useState, useEffect } from 'react';
import { type Meeting } from './MeetingCard';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  CheckIcon,
  QrCodeIcon,
  SwatchIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

type MeetingFormProps = {
  initialData?: Meeting;
  onSave: (meeting: Meeting) => Promise<void>;
  onCancel: (savedMeeting?: Meeting) => void;
  isSaving?: boolean;
};

type StatusType = 'active' | 'completed' | 'inactive';

// Interface pour la configuration QR Code
interface QRConfig {
  backgroundColor?: string;
  foregroundColor?: string;
  size?: number;
  includeMargin?: boolean;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  includeText?: boolean;
  customText?: string;
  logoUrl?: string;
}

export const MeetingForm = ({ initialData, onSave, onCancel, isSaving = false }: MeetingFormProps) => {
  console.log('MeetingForm initialData:', JSON.stringify(initialData, null, 2));
  
  const [formData, setFormData] = useState<Omit<Meeting, 'id'>>({
    uniqueCode: initialData?.uniqueCode || '', // Utiliser uniquement uniqueCode
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: (initialData?.status as StatusType) || 'active', // Par défaut 'active' au lieu de 'inactive'
    start_date: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 16)
      : initialData?.start_date || '',
    location: initialData?.location || '',
    max_participants: initialData?.max_participants || 10,
  });

  // Configuration QR Code
  const [qrConfig, setQRConfig] = useState<QRConfig>(initialData?.qrConfig || {
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    size: 256,
    includeMargin: true,
    errorCorrectionLevel: 'M',
    includeText: true,
    customText: '',
    logoUrl: ''
  });

  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<'general' | 'qrcode'>('general');

  // Régénérer le code si c'est une nouvelle réunion
  // Plus besoin de cet useEffect car le code unique est maintenant géré dans l'initialisation

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      // Préparer les données à envoyer au backend
      if (!formData.start_date) {
        throw new Error('La date de début est requise');
      }

      // Vérifier que la date est valide
      const dateObj = new Date(formData.start_date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Format de date invalide');
      }
      
      // Convertir la date en format ISO et nettoyer les données avant envoi
      const meetingWithQR = {
        ...formData,
        startDate: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        start_date: undefined, // Supprimer l'ancien format
        uniqueCode: initialData?.uniqueCode, // Conserver le code existant pour les modifications
        qrConfig: qrConfig
      };
      
      // Déterminer si c'est une création ou une modification
      const isUpdate = initialData && initialData.id && initialData.id > 0;
      const method = isUpdate ? 'PUT' : 'POST';
      const url = isUpdate
        ? apiUrl(`/meetings/${initialData.id}`)
        : apiUrl('/meetings');
      
      console.log('Operation type:', isUpdate ? 'UPDATE' : 'CREATE');
      console.log('Meeting ID:', initialData?.id);
      console.log('Method:', method);
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify(meetingWithQR),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${initialData ? 'update' : 'create'} meeting`);
      }

      const data = await response.json();
      console.log('Meeting saved:', data);
      
      // Transmettre les données sauvegardées au parent via onSave
      await onSave({
        ...data,
        id: data.id || initialData?.id,
        uniqueCode: data.uniqueCode,
        startDate: data.startDate,
        // Forcer la mise à jour du code unique dans le formulaire
        qrConfig: qrConfig
      });

      // Mettre à jour localement le code unique affiché
      setFormData(prev => ({
        ...prev,
        uniqueCode: data.uniqueCode
      }));
      
      // Fermer le formulaire après un court délai pour voir la mise à jour
      setTimeout(() => {
        onCancel();
      }, 500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      console.error('Erreur:', err);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    // Fermer simplement la modal sans transmettre de données
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value) || 0 : value
    }));
  };

  const handleQRConfigChange = (field: keyof QRConfig, value: string | number | boolean) => {
    setQRConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (status: StatusType) => {
    // Empêcher de passer en "completed" pour les nouvelles réunions non enregistrées
    if (status === 'completed' && (!initialData || !initialData.id)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      status: status as 'active' | 'completed' | 'inactive'
    }));
  };

  const getStatusConfig = () => {
    return [
      {
        key: 'active' as StatusType,
        label: 'En cours',
        icon: PlayIcon,
        color: 'green',
        bgActive: 'bg-green-100 border-green-500 text-green-700',
        bgInactive: 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-300',
        indicator: 'bg-green-500'
      },
      {
        key: 'completed' as StatusType,
        label: 'Terminé',
        icon: CheckIcon,
        color: 'red',
        bgActive: 'bg-red-100 border-red-500 text-red-700',
        bgInactive: 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-300',
        indicator: 'bg-red-500'
      },
      // {
      //   key: 'inactive' as StatusType,
      //   label: 'En attente',
      //   icon: ClockIcon,
      //   color: 'blue',
      //   bgActive: 'bg-blue-100 border-blue-500 text-blue-700',
      //   bgInactive: 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-300',
      //   indicator: 'bg-blue-500'
      // }
    ];
  };

  const statusConfig = getStatusConfig();
  // Suppression de currentStatus qui n'est plus utilisé

  // S'assurer que le statut "active" est sélectionné visuellement par défaut
  useEffect(() => {
    if (!initialData) {
      // Pour les nouvelles réunions, forcer le statut "active"
      setFormData(prev => ({
        ...prev,
        status: 'active'
      }));
    }
  }, [initialData]);

  // Couleurs prédéfinies pour le QR Code
  const presetColors = [
    { name: 'Noir', value: '#000000' },
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Vert', value: '#10B981' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Violet', value: '#8B5CF6' }
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-xl shadow-lg w-full max-w-4xl backdrop-blur-sm max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? 'Modifier Réunion' : 'Nouvelle Réunion'}
            </h2>
            <button 
              onClick={() => onCancel()}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Onglets */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Informations générales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qrcode')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'qrcode'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <QrCodeIcon className="h-4 w-4" />
              <span>Configuration QR Code</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Onglet Informations générales */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Sélecteur de statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Statut de la réunion*
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {statusConfig.filter(status => status.key !== 'inactive').map((status) => {
                        const Icon = status.icon;
                        const isActive = formData.status === status.key;
                        const isNewMeeting = !initialData || !initialData.id;
                        const isCompletedDisabled = status.key === 'completed' && isNewMeeting;
                        
                        return (
                          <button
                            key={status.key}
                            type="button"
                            onClick={() => !isCompletedDisabled && handleStatusChange(status.key)}
                            disabled={isCompletedDisabled}
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                              isActive ? status.bgActive :
                              isCompletedDisabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' :
                              status.bgInactive
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${status.indicator} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                            <Icon className="h-5 w-5" />
                            <span className="text-sm font-medium">{status.label}</span>
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-current flex items-center justify-center">
                                <CheckIcon className="h-3 w-3" />
                              </div>
                            )}
                            {isCompletedDisabled && (
                              <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date et Heure*
                      </label>
                      <input
                        type="datetime-local"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div> */}

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Lieu*
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-500 mb-1">
                        Code Unique (généré automatiquement)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="uniqueCode"
                          name="uniqueCode"
                          value={formData.uniqueCode}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {formData.uniqueCode ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formData.uniqueCode
                          ? 'Code unique généré'
                          : 'En attente de génération...'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div>
                      <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
                        Participants Max
                      </label>
                      <input
                        type="number"
                        id="max_participants"
                        name="max_participants"
                        value={formData.max_participants}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div> */}

                    
                  </div>
                </div>
              )}

              {/* Onglet Configuration QR Code */}
              {activeTab === 'qrcode' && (
                <div className="space-y-6">
                  {/* Aperçu du QR Code */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Aperçu du QR Code</h3>
                    <div 
                      className="inline-block p-4 rounded-lg"
                      style={{ backgroundColor: qrConfig.backgroundColor }}
                    >
                      <div
                        className="rounded-lg"
                        style={{
                          width: `${(qrConfig.size || 256) / 4}px`,
                          height: `${(qrConfig.size || 256) / 4}px`,
                          backgroundColor: qrConfig.foregroundColor
                        }}
                      >
                        <QrCodeIcon className="w-full h-full p-2" style={{ color: qrConfig.backgroundColor }} />
                      </div>
                    </div>
                    {qrConfig.includeText && (
                      <p className="text-sm text-gray-600 mt-2">
                        {qrConfig.customText || formData.title || 'Nom de la réunion'}
                      </p>
                    )}
                  </div>

                  {/* Couleurs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <SwatchIcon className="h-4 w-4 inline mr-2" />
                        Couleur du QR Code
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {presetColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleQRConfigChange('foregroundColor', color.value)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              qrConfig.foregroundColor === color.value 
                                ? 'border-orange-500 ring-2 ring-orange-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            <span className="sr-only">{color.name}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="color"
                        value={qrConfig.foregroundColor}
                        onChange={(e) => handleQRConfigChange('foregroundColor', e.target.value)}
                        className="w-full h-10 rounded-md border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Couleur de fond
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { name: 'Blanc', value: '#FFFFFF' },
                          { name: 'Gris clair', value: '#F3F4F6' },
                          { name: 'Transparent', value: 'transparent' }
                        ].map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleQRConfigChange('backgroundColor', color.value)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              qrConfig.backgroundColor === color.value 
                                ? 'border-orange-500 ring-2 ring-orange-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color.value === 'transparent' ? '#fff' : color.value }}
                            title={color.name}
                          >
                            {color.value === 'transparent' && (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded opacity-50"></div>
                            )}
                            <span className="sr-only">{color.name}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="color"
                        value={qrConfig.backgroundColor}
                        onChange={(e) => handleQRConfigChange('backgroundColor', e.target.value)}
                        className="w-full h-10 rounded-md border border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Taille et options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taille du QR Code
                      </label>
                      <select
                        value={qrConfig.size}
                        onChange={(e) => handleQRConfigChange('size', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value={128}>Petit (128px)</option>
                        <option value={256}>Moyen (256px)</option>
                        <option value={512}>Grand (512px)</option>
                        <option value={1024}>Très grand (1024px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau de correction derreur
                      </label>
                      <select
                        value={qrConfig.errorCorrectionLevel}
                        onChange={(e) => handleQRConfigChange('errorCorrectionLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="L">Faible (7%)</option>
                        <option value="M">Moyen (15%)</option>
                        <option value="Q">Élevé (25%)</option>
                        <option value="H">Très élevé (30%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Options supplémentaires */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="includeMargin"
                        checked={qrConfig.includeMargin}
                        onChange={(e) => handleQRConfigChange('includeMargin', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeMargin" className="text-sm font-medium text-gray-700">
                        Inclure une marge autour du QR Code
                      </label>
                    </div>

                    {/* <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="includeText"
                        checked={qrConfig.includeText}
                        onChange={(e) => handleQRConfigChange('includeText', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeText" className="text-sm font-medium text-gray-700">
                        Afficher le texte sous le QR Code
                      </label>
                    </div> */}

                    {/* {qrConfig.includeText && (
                      <div>
                        <label htmlFor="customText" className="block text-sm font-medium text-gray-700 mb-1">
                          Texte personnalisé (optionnel)
                        </label>
                        <input
                          type="text"
                          id="customText"
                          value={qrConfig.customText}
                          onChange={(e) => handleQRConfigChange('customText', e.target.value)}
                          placeholder="Laissez vide pour utiliser le titre de la réunion"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    )} */}

                    {/* <div>
                      <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        <PhotoIcon className="h-4 w-4 inline mr-2" />
                        Logo à intégrer (URL de limage)
                      </label>
                      <input
                        type="url"
                        id="logoUrl"
                        value={qrConfig.logoUrl}
                        onChange={(e) => handleQRConfigChange('logoUrl', e.target.value)}
                        placeholder="https://exemple.com/logo.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Le logo sera centré dans le QR Code. Recommandé: format carré, taille max 20% du QR Code.
                      </p>
                    </div> */}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
              {submitError && (
                <div className="flex-1 text-red-500 text-sm">
                  {submitError}
                </div>
              )}
              <button
                type="button"
                onClick={() => onCancel()}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 rounded-xl shadow-lg w-full max-w-md p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer cette réunion ? Cette action est irréversible.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


