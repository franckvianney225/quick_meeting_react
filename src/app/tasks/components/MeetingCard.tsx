'use client';
import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  QrCodeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { generateAttendancePDF } from './AttendanceListPDF';
import { generateMeetingQRPDF } from './MeetingQRPDF';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

export interface Meeting {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'inactive';
  start_date?: string;
  startDate?: string;
  meetingStartDate?: string;
  meetingEndDate?: string;
  location?: string;
  max_participants?: number;
  maxParticipants?: number;
  uniqueCode: string;
  participants_count?: number; // Ajout du compteur de participants
  qrConfig?: {
    backgroundColor?: string;
    foregroundColor?: string;
    size?: number;
    includeMargin?: boolean;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    includeText?: boolean;
    customText?: string;
    logoUrl?: string;
  };
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meetingId: number) => void;
  onDelete: (meetingId: number) => void;
  onView: (meetingId: number) => void;
  onGenerateQR?: (meetingId: number) => void;
  onAttendanceList?: (meetingId: number) => void;
  onDeleteRequest?: (meetingId: number, meetingTitle: string) => void;
}

export const MeetingCard = ({
  meeting,
  onEdit,
  onDelete,
  onView,
  onGenerateQR,
  onAttendanceList,
  onDeleteRequest
}: MeetingCardProps) => {
  const [showUniqueCode, setShowUniqueCode] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(meeting.participants_count || 0);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteRequest) {
      onDeleteRequest(meeting.id, meeting.title);
    } else {
      // Fallback si onDeleteRequest n'est pas fourni
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement la réunion "${meeting.title}" ? Cette action ne peut pas être annulée.`
      );
      
      if (confirmed) {
        onDelete(meeting.id);
      }
    }
  };

  const handleGenerateQR = async () => {
    try {
      if (!meeting.uniqueCode) {
        throw new Error('Code unique manquant pour générer le QR code');
      }

      const formUrl = `${window.location.origin}/participant-form?meetingId=${meeting.id}&code=${meeting.uniqueCode}`;

      await generateMeetingQRPDF({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        qrValue: formUrl,
        qrConfig: meeting.qrConfig,
        fileName: `${meeting.title}_Code_QR.pdf`,
        onError: (error: Error) => {
          console.error('Erreur génération PDF:', error);
          alert(`Erreur: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur inconnue est survenue'}`);
    }
  };

  const handleAttendanceList = async () => {
    try {
      console.log('Début récupération participants pour meeting:', meeting.id);
      
      const authHeaders = AuthService.getAuthHeaders();
      console.log('Auth headers:', authHeaders);
      
      const url = apiUrl(`/meetings/${meeting.id}/participants?order=DESC`);
      console.log('URL:', url);
      
      const response = await fetch(url, {
        headers: authHeaders
      });
      
      console.log('Réponse status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        try {
          const errorData = await response.text();
          console.log('Détails erreur:', errorData);
          errorMessage += ` - ${errorData}`;
        } catch (e) {
          console.log('Impossible de lire le message d\'erreur');
        }
        throw new Error(errorMessage);
      }
      
      const apiParticipants = await response.json();
      console.log('Participants récupérés:', apiParticipants.length);

      // Définir l'interface pour les données de l'API
      interface ApiParticipant {
        id: number;
        name: string;
        prenom: string;
        email: string;
        phone: string;
        fonction: string;
        organisation: string;
        createdAt?: string;
        submittedAt?: string;
        signatureDate?: string;
        registeredAt?: string;
        location?: string;
        signature?: string;
      }
      
      // Mapper les données de l'API vers l'interface attendue par le PDF (même mapping que MeetingDetails)
      const mappedParticipants = apiParticipants.map((p: ApiParticipant) => ({
        id: p.id,
        firstName: p.prenom,        // prénom = first name
        lastName: p.name,           // name = last name (nom de famille)
        email: p.email,
        phone: p.phone,
        function: p.fonction,
        organization: p.organisation,
        submittedAt: p.submittedAt,
        signatureDate: p.signatureDate,
        createdAt: p.createdAt,
        registeredAt: p.signatureDate || p.createdAt || p.submittedAt || p.registeredAt,
        location: p.location,
        signature: p.signature
      }));

      console.log('Génération PDF avec', mappedParticipants.length, 'participants');
      
      await generateAttendancePDF({
        meetingTitle: meeting.title,
        participants: mappedParticipants,
        onClose: () => {}
      });
      
      console.log('PDF généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération de la liste:', error);
      alert(`Erreur lors de l'impression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Charger le nombre de participants si non fourni
  useEffect(() => {
    const loadParticipantsCount = async () => {
      if (meeting.participants_count !== undefined) return;
      
      try {
        setLoadingParticipants(true);
        const response = await fetch(apiUrl(`/meetings/${meeting.id}/participants`), {
          headers: AuthService.getAuthHeaders()
        });
        
        if (response.ok) {
          const participants = await response.json();
          setParticipantsCount(participants.length || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de participants:', error);
      } finally {
        setLoadingParticipants(false);
      }
    };

    loadParticipantsCount();
  }, [meeting.id, meeting.participants_count]);


  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-400 animate-pulse';
      case 'completed': return 'bg-gradient-to-r from-red-400 to-red-600 text-white border-red-400';
      case 'inactive': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'En cours';
      case 'completed': return 'Terminé';
      case 'inactive': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      if (meeting.startDate) {
        dateString = meeting.startDate;
      } else {
        return 'Date non définie';
      }
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div
        className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
        onClick={() => meeting.id && onView(meeting.id)}
      >
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 hover:text-orange-600 transition-colors duration-200">
              {meeting.title.length > 40 ? `${meeting.title.substring(0, 40)}...` : meeting.title}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{meeting.description}</p>
          </div>
          <span className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold border ${getStatusColor(meeting.status)}`}>
            {getStatusLabel(meeting.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-md sm:rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium">{formatDate(meeting.start_date || meeting.startDate)}</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-md sm:rounded-lg flex items-center justify-center">
              <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{meeting.location || 'Lieu non défini'}</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-md sm:rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium">
              {loadingParticipants ? (
                <span className="text-gray-400">...</span>
              ) : (
                `${participantsCount} participant${participantsCount !== 1 ? 's' : ''}`
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-md sm:rounded-lg flex items-center justify-center">
              <QrCodeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-sm font-medium font-mono">
                {meeting.uniqueCode ? (showUniqueCode ? meeting.uniqueCode : '*******') : 'Non généré'}
              </span>
              {meeting.uniqueCode && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUniqueCode(!showUniqueCode);
                    }}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title={showUniqueCode ? 'Masquer le code' : 'Afficher le code'}
                  >
                    <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                        navigator.clipboard.writeText(meeting.uniqueCode);
                        alert('Code copié !');
                      } else {
                        // Fallback pour les environnements sans clipboard API
                        const textArea = document.createElement('textarea');
                        textArea.value = meeting.uniqueCode;
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                          document.execCommand('copy');
                          alert('Code copié !');
                        } catch (err) {
                          alert('Impossible de copier le code. Veuillez le copier manuellement.');
                        }
                        document.body.removeChild(textArea);
                      }
                    }}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title="Copier le code"
                  >
                    <ClipboardDocumentListIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-orange-200/30 space-y-3 sm:space-y-0">
          <div className="flex justify-center sm:justify-start space-x-2 sm:space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                meeting.id && onView(meeting.id);
              }}
              className="p-3 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Voir détails"
            >
              <EyeIcon className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                meeting.id && onEdit(meeting.id);
              }}
              className="p-3 sm:p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Modifier"
            >
              <PencilIcon className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>

            <button
              onClick={handleDeleteClick}
              className="p-3 sm:p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Supprimer"
            >
              <TrashIcon className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="flex justify-center sm:justify-end space-x-2 sm:space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateQR();
              }}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg text-sm font-medium"
            >
              <QrCodeIcon className="h-4 w-4 sm:h-4 sm:w-4" />
              <span>Code QR</span>
            </button>

            {/* Bouton Liste de présence - masqué sur mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAttendanceList();
              }}
              className="hidden sm:flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg text-sm font-medium"
            >
              <ClipboardDocumentListIcon className="h-4 w-4 sm:h-4 sm:w-4" />
              <span>Liste de présence</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
};
