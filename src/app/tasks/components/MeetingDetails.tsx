'use client';
import { useState, useEffect } from 'react';
import { type Participant } from './Participants/ParticipantsList';
import { generateAttendancePDF } from './AttendanceListPDF';
import { generateMeetingQRPDF } from './MeetingQRPDF';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TagIcon,
  ArrowLeftIcon,
  PencilIcon,
  QrCodeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { type Meeting } from './MeetingCard';
import { MeetingForm } from './MeetingForm';
import { ParticipantsList } from './Participants/ParticipantsList';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

interface MeetingDetailsProps {
  meeting: Meeting;
  onBack: () => void;
  onEdit: (meetingId: number) => void;
  onGenerateQR?: (meetingId: number) => void;
  onAttendanceList: (meetingId: number) => void;
}

export const MeetingDetails = ({ 
  meeting, 
  onBack, 
  onEdit, 
  onGenerateQR,
  onAttendanceList
}: MeetingDetailsProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showUniqueCode, setShowUniqueCode] = useState(false);
  
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

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleSaveEdit = async (meetingData: Omit<Meeting, 'id'>) => {
    setShowEditForm(false);
    onEdit(meeting.id);
    return Promise.resolve();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  const handleAttendanceListClick = async () => {
    let timeoutId: NodeJS.Timeout;
    try {
      setIsSubmitting(true);
      
      // Timeout de secours au cas où le callback ne serait pas appelé
      timeoutId = setTimeout(() => {
        setIsSubmitting(false);
      }, 5000); // 5 secondes max

      const response = await fetch(apiUrl(`/meetings/${meeting.id}/participants`), {
        headers: AuthService.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des participants');
      }
      const participants = await response.json();
      
      await generateAttendancePDF({
        meetingTitle: meeting.title,
        participants: participants,
        onClose: () => {
          clearTimeout(timeoutId);
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la liste:', error);
      clearTimeout(timeoutId!);
      setIsSubmitting(false);
    } finally {
      clearTimeout(timeoutId!);
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'active':
        return {
          label: 'Actif',
          color: 'bg-green-100 text-green-800 border-green-200',
          indicator: 'bg-green-500'
        };
      case 'completed':
        return {
          label: 'Terminé',
          color: 'bg-red-100 text-red-800 border-red-200',
          indicator: 'bg-red-500'
        };
      case 'inactive':
        return {
          label: 'En attente',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          indicator: 'bg-blue-500'
        };
      default:
        return {
          label: 'Inconnu',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          indicator: 'bg-gray-500'
        };
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

  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        const response = await fetch(apiUrl(`/meetings/${meeting.id}/participants`), {
          headers: AuthService.getAuthHeaders()
        });
        if (response.ok) {
          const participants = await response.json();
          setParticipantCount(participants.length);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des participants:', error);
      }
    };

    fetchParticipantCount();
  }, [meeting.id]);

  const statusConfig = getStatusConfig(meeting.status);
  const formattedDate = formatDate(meeting.start_date || meeting.startDate);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header avec bouton retour stylisé */}
          <div className="mb-8">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className={`group inline-flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-6 ${
                isSubmitting 
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                  : 'text-gray-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                isSubmitting 
                  ? 'bg-gray-200' 
                  : 'bg-gray-100 group-hover:bg-orange-100'
              }`}>
                <ArrowLeftIcon className="h-4 w-4" />
              </div>
              <span className="font-medium">Retour à la liste</span>
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{meeting.title}</h1>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
                    <div className={`w-3 h-3 rounded-full ${statusConfig.indicator}`} />
                    <span className="text-sm font-medium">{statusConfig.label}</span>
                  </div>
                  {meeting.uniqueCode && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                        {showUniqueCode ? meeting.uniqueCode : '*******'}
                      </span>
                      <button
                        onClick={() => setShowUniqueCode(!showUniqueCode)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title={showUniqueCode ? 'Masquer le code' : 'Afficher le code'}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(meeting.uniqueCode);
                          alert('Code copié dans le presse-papier !');
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copier le code"
                      >
                        <ClipboardDocumentListIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEditClick}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors font-medium`}
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Modifier</span>
                </button>
                
                <button
                  onClick={handleGenerateQR}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 ${isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg transition-colors font-medium`}
                >
                  <QrCodeIcon className="h-5 w-5" />
                  <span>QR Code</span>
                </button>
                
                <button
                  onClick={handleAttendanceListClick}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors font-medium`}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  <span>Liste de présence</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal en pleine largeur */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Section principale - 3 colonnes sur desktop */}
            <div className="xl:col-span-3 space-y-8">
              {/* Section Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {meeting.description || 'Aucune description fournie pour cette réunion.'}
                </p>
              </div>

              {/* Détails de la réunion */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">Détails de la réunion</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {/* Date et heure */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Date de creation</h3>
                      <p className="text-gray-600">{formatDate(meeting.start_date || meeting.startDate)}</p>
                    </div>
                  </div>

                  {/* Lieu */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <MapPinIcon className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Lieu</h3>
                      <p className="text-gray-600">{meeting.location || 'Lieu non défini'}</p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Participants max:</h3>
                      <p className="text-gray-600">
                        {meeting.max_participants ? `${meeting.max_participants} personnes` : 'Illimité'}
                      </p>
                    </div>
                  </div>

                  {/* Code unique */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <TagIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Code accès</h3>
                      {meeting.uniqueCode ? (
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded-lg text-sm inline-block">
                            {showUniqueCode ? meeting.uniqueCode : '*******'}
                          </p>
                          <button
                            onClick={() => setShowUniqueCode(!showUniqueCode)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title={showUniqueCode ? 'Masquer le code' : 'Afficher le code'}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(meeting.uniqueCode);
                              alert('Code copié dans le presse-papier !');
                            }}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copier le code"
                          >
                            <ClipboardDocumentListIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-600">Code non défini</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des participants */}
              <ParticipantsList 
                meetingId={meeting.id} 
                meetingTitle={meeting.title} 
              />
            </div>

            {/* Sidebar - 1 colonne sur desktop */}
            <div className="xl:col-span-1">
              {/* Statistiques rapides */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques</h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                      <UsersIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{participantCount}</div>
                    <div className="text-sm text-gray-600">Inscrits</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                      <ClockIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2h</div>
                    <div className="text-sm text-gray-600">Durée estimée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'édition */}
      {showEditForm && (
        <MeetingForm
          initialData={meeting}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
};
