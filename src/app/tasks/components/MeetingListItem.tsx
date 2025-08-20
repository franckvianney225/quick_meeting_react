'use client';
import { useState } from 'react';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { type Meeting } from './MeetingCard';
import { generateMeetingQRPDF } from './MeetingQRPDF';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

// Ajouter startDate à l'interface Meeting
interface ExtendedMeeting extends Meeting {
  startDate?: string;
}
import { generateAttendancePDF } from './AttendanceListPDF';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const MeetingListItem = ({ meeting, onView, onEdit, onDelete, onAttendanceList }: {
  meeting: ExtendedMeeting;
  onView: (meetingId: number) => void;
  onEdit: (meetingId: number) => void;
  onDelete: (meetingId: number) => void;
  onGenerateQR?: (meetingId: number) => void;
  onAttendanceList: (meetingId: number) => void;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleAttendanceList = async (meetingId: number) => {
    try {
      const response = await fetch(apiUrl(`/meetings/${meetingId}/participants?order=DESC`), {
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(meeting.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'completed': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'inactive': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
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

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Date non définie';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white/60 backdrop-blur-sm border-b border-orange-200/30 hover:bg-white/80 hover:border-orange-300/50 transition-all duration-300">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

              <div className="md:col-span-2">
                <h3 className="font-bold text-gray-900 mb-1 hover:text-orange-600 transition-colors duration-200">{meeting.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{meeting.description}</p>
                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-full">{meeting.uniqueCode}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{formatDate(meeting.startDate || meeting.start_date)}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium truncate">{meeting.location}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{meeting.max_participants || '∞'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-xl text-xs font-bold ${getStatusColor(meeting.status)}`}>
                {getStatusLabel(meeting.status)}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onView(meeting.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Voir détails"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onEdit(meeting.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={handleGenerateQR}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Générer QR Code"
                >
                  <QrCodeIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAttendanceList(meeting.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Liste de présence"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Supprimer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
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
