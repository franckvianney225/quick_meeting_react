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
      
      const formUrl = `http://localhost:3000/participant-form?meetingId=${meeting.id}&code=${meeting.uniqueCode}`;
      
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
      const response = await fetch(`http://localhost:3001/meetings/${meetingId}/participants?order=DESC`, {
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{meeting.description}</p>
                <span className="text-xs text-gray-500 font-mono">{meeting.uniqueCode}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                <span>{formatDate(meeting.startDate || meeting.start_date)}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{meeting.location}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
                <span>{meeting.max_participants || '∞'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                {getStatusLabel(meeting.status)}
              </span>

              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => onView(meeting.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir détails"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => onEdit(meeting.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={handleGenerateQR}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Générer QR Code"
                >
                  <QrCodeIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleAttendanceList(meeting.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Liste de présence"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
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

