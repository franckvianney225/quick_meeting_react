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
import { ConfirmModal } from '@/components/ui/ConfirmModal';
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
}

export const MeetingCard = ({
  meeting,
  onEdit,
  onDelete,
  onView,
  onGenerateQR,
  onAttendanceList
}: MeetingCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUniqueCode, setShowUniqueCode] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(meeting.participants_count || 0);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
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
      const response = await fetch(apiUrl(`/meetings/${meeting.id}/participants?order=DESC`), {
        headers: AuthService.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des participants');
      }
      const participants = await response.json();

      await generateAttendancePDF({
        meetingTitle: meeting.title,
        participants: participants,
        onClose: () => {}
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la liste:', error);
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

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (meeting.id) {
      onDelete(meeting.id);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

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
      case 'active': return 'Actif';
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
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-600 transition-colors duration-200">
              {meeting.title.length > 50 ? `${meeting.title.substring(0, 50)}...` : meeting.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">{meeting.description}</p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${getStatusColor(meeting.status)}`}>
            {getStatusLabel(meeting.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{formatDate(meeting.start_date || meeting.startDate)}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{meeting.location || 'Lieu non défini'}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">
              {loadingParticipants ? (
                <span className="text-gray-400">Chargement...</span>
              ) : (
                `${participantsCount} participant${participantsCount !== 1 ? 's' : ''} enregistré${participantsCount !== 1 ? 's' : ''}`
              )}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <QrCodeIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium font-mono">
                {meeting.uniqueCode ? (showUniqueCode ? meeting.uniqueCode : '*******') : 'Non généré'}
              </span>
              {meeting.uniqueCode && (
                <>
                  <button
                    onClick={() => setShowUniqueCode(!showUniqueCode)}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title={showUniqueCode ? 'Masquer le code' : 'Afficher le code'}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(meeting.uniqueCode);
                      alert('Code copié dans le presse-papier !');
                    }}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title="Copier le code"
                  >
                    <ClipboardDocumentListIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-orange-200/30">
          <div className="flex space-x-2">
            <button
              onClick={() => meeting.id && onView(meeting.id)}
              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Voir détails"
            >
              <EyeIcon className="h-4 w-4" />
            </button>

            <button
              onClick={() => meeting.id && onEdit(meeting.id)}
              className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Modifier"
            >
              <PencilIcon className="h-4 w-4" />
            </button>

            <button
              onClick={handleDeleteClick}
              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Supprimer"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleGenerateQR}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <QrCodeIcon className="h-4 w-4" />
              <span className="text-sm font-medium">QR Code</span>
            </button>

            <button
              onClick={handleAttendanceList}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <ClipboardDocumentListIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Liste de présence</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Supprimer la réunion"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la réunion "${meeting.title}" ? Cette action ne peut pas être annulée.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </>
  );
};
