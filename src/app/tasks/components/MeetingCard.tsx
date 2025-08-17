'use client';
import { useState } from 'react';
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
import { AttendanceListPDF as GenerateAttendanceListPDF } from './AttendanceListPDF';
import { generateMeetingQRPDF } from './MeetingQRPDF';

export interface Meeting {
  id: number; // ID maintenant obligatoire
  title: string;
  description: string;
  status: 'active' | 'completed' | 'inactive';
  start_date?: string;
  startDate?: string;
  location?: string;
  max_participants?: number;
  maxParticipants?: number;
  uniqueCode: string;
  qrConfig?: {
    color?: {
      dark?: string;
      light?: string;
    };
    size?: number;
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
  const [showQRModal, setShowQRModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

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
        onError: (error) => {
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
      const response = await fetch(`http://localhost:3001/meetings/${meeting.id}/participants`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des participants');
      }
      const participants = await response.json();
      
      GenerateAttendanceListPDF({
        meetingTitle: meeting.title,
        participants,
        onClose: () => {}
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la liste:', error);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    if (!dateString) return 'Date non définie';
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{meeting.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{meeting.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
            {getStatusLabel(meeting.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm">{formatDate(meeting.start_date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPinIcon className="h-4 w-4" />
            <span className="text-sm">{meeting.location || 'Lieu non défini'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <UserGroupIcon className="h-4 w-4" />
            <span className="text-sm">
              {meeting.max_participants ? `Max ${meeting.max_participants}` : 'Illimité'} participants
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-sm font-medium">
              Code: {meeting.uniqueCode || 'Non généré'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <button 
              onClick={() => meeting.id && onView(meeting.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Voir détails"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => meeting.id && onEdit(meeting.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={handleDeleteClick}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleGenerateQR}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <QrCodeIcon className="h-4 w-4" />
              <span className="text-sm font-medium">QR Code</span>
            </button>
            
            <button
              onClick={handleAttendanceList}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ClipboardDocumentListIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Liste de présence</span>
            </button>
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

      {/* Ancienne implémentation modale retirée */}
    </>
  );
};
