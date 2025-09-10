'use client';
import { useState, useEffect } from 'react';
import { type Meeting } from './MeetingCard';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import { LocationInput } from '@/components/ui/LocationInput';
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
    meetingStartDate: initialData?.meetingStartDate
      ? new Date(initialData.meetingStartDate).toISOString().slice(0, 16)
      : '',
    meetingEndDate: initialData?.meetingEndDate
      ? new Date(initialData.meetingEndDate).toISOString().slice(0, 16)
      : '',
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

  // Validation des dates initiales
  useEffect(() => {
    if (formData.meetingStartDate && formData.meetingEndDate) {
      validateMeetingEndDate(formData.meetingEndDate, formData.meetingStartDate);
    }
  }, []); // Exécuté seulement au montage du composant

  // Régénérer le code si c'est une nouvelle réunion
  // Plus besoin de cet useEffect car le code unique est maintenant géré dans l'initialisation

  const [submitError, setSubmitError] = useState<string | null>(null);

  // État pour la validation en temps réel de la date de fin
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Reset la validation temps réel lors de la soumission
    setDateValidationError(null);
    
    try {
      // Préparer les données à envoyer au backend
      if (!formData.start_date) {
        throw new Error('La date de début est requise');
      }

      // Vérifier que les dates sont valides
      const dateObj = new Date(formData.start_date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Format de date invalide');
      }

      // Vérifier que la date de fin de réunion n'est pas inférieure à la date de début
      if (formData.meetingStartDate && formData.meetingEndDate) {
        const startDateTime = new Date(formData.meetingStartDate);
        const endDateTime = new Date(formData.meetingEndDate);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error('Format de date de réunion invalide');
        }

        if (endDateTime <= startDateTime) {
          throw new Error('L\'heure de la fin ne peut pas être inférieure ou égale à l\'heure de la début de réunion');
        }
      }

      // Vérifier aussi l'erreur de validation temps réel
      if (dateValidationError) {
        throw new Error(dateValidationError);
      }
      
      // Convertir les dates en format ISO et nettoyer les données avant envoi
      const meetingWithQR = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        meetingstartdate: formData.meetingStartDate ? new Date(formData.meetingStartDate).toISOString() : undefined,
        meetingenddate: formData.meetingEndDate ? new Date(formData.meetingEndDate).toISOString() : undefined,
        startDate: undefined, // Supprimer l'ancien format
        meetingStartDate: undefined, // Supprimer le format camelCase
        meetingEndDate: undefined, // Supprimer le format camelCase
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
      console.log('Meeting start date from server:', data.meetingStartDate || data.meetingstartdate);
      console.log('Meeting end date from server:', data.meetingEndDate || data.meetingenddate);
      
      // Transmettre les données sauvegardées au parent via onSave
      await onSave({
        ...data,
        id: data.id || initialData?.id,
        uniqueCode: data.uniqueCode,
        startDate: data.startDate || data.start_date,
        meetingStartDate: data.meetingStartDate || data.meetingstartdate,
        meetingEndDate: data.meetingEndDate || data.meetingenddate,
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

    // Validation en temps réel pour la date de fin
    if (name === 'meetingEndDate') {
      validateMeetingEndDate(value, formData.meetingStartDate);
    }

    // Validation en temps réel pour la date de début aussi
    if (name === 'meetingStartDate') {
      if (formData.meetingEndDate) {
        validateMeetingEndDate(formData.meetingEndDate, value);
      }
    }
  };

  const validateMeetingEndDate = (endDateValue: string, startDateValue?: string) => {
    if (endDateValue && startDateValue) {
      const startDate = new Date(startDateValue);
      const endDate = new Date(endDateValue);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (endDate <= startDate) {
          setDateValidationError('L\'heure de fin ne peut pas être inférieure ou égale à l\'heure de début');
        } else {
          setDateValidationError(null);
        }
      }
    } else {
      setDateValidationError(null);
    }
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
      <div className="bg-white/95 rounded-xl shadow-lg w-full max-w-4xl backdrop-blur-sm max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête fixe */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
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
          <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
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
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
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
                      <label htmlFor="meetingStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de début de réunion
                      </label>
                      <input
                        type="datetime-local"
                        id="meetingStartDate"
                        name="meetingStartDate"
                        value={formData.meetingStartDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="meetingEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin de réunion
                      </label>
                      <input
                        type="datetime-local"
                        id="meetingEndDate"
                        name="meetingEndDate"
                        value={formData.meetingEndDate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                          dateValidationError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      {dateValidationError && (
                        <p className="mt-1 text-sm text-red-600">{dateValidationError}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Lieu*
                      </label>
                      <LocationInput
                        value={formData.location}
                        onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                        placeholder="Entrez le lieu de la réunion (ex: Abidjan, Plateau)"
                        required
                      />
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

            {/* Pied de page fixe avec boutons - Design modernisé */}
            <div className="border-t border-orange-200/30 bg-white/95 backdrop-blur-sm p-6 flex-shrink-0">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-4">
                {submitError && (
                  <div className="flex-1 text-red-500 text-sm font-medium">
                    {submitError}
                  </div>
                )}
                <div className="flex space-x-3 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => onCancel()}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 py-3.5 border border-orange-300 rounded-xl shadow-sm text-sm font-semibold text-orange-700 bg-white hover:bg-orange-50 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center">
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-medium">Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span className="font-medium">Enregistrer</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
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


