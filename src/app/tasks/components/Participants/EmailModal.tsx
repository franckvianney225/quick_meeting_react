'use client';
import { useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import JoditEditor from 'jodit-react';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: number;
  meetingTitle: string;
  participantCount: number;
  participantIds: number[];
}

interface EmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SendEmailsResponse {
  success: boolean;
  results: EmailResult[];
}

export const EmailModal = ({ 
  isOpen, 
  onClose, 
  meetingId, 
  meetingTitle, 
  participantCount,
  participantIds 
}: EmailModalProps) => {
  const [emailContent, setEmailContent] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const editorRef = useRef<string>('');

  // Fonction pour envoyer les emails aux participants
  const sendEmailsToParticipants = async () => {
    const contentToSend = editorRef.current || emailContent;
    if (!contentToSend.trim()) {
      setEmailError('Veuillez saisir un message');
      return;
    }

    try {
      setSendingEmail(true);
      setEmailError(null);
      
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch(apiUrl(`/meetings/${meetingId}/send-emails`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Message concernant la réunion: ${meetingTitle}`,
          message: editorRef.current || emailContent,
          selectedParticipants: participantIds.length > 0 ? participantIds : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result: SendEmailsResponse = await response.json();
      
      // Afficher le résultat de l'envoi
      if (result.success) {
        setEmailSuccess(true);
        console.log('Emails envoyés avec succès:', result);
      } else {
        // Gérer les échecs partiels
        const failedEmails = result.results.filter((r: EmailResult) => !r.success);
        if (failedEmails.length > 0) {
          setEmailError(`Certains emails n'ont pas pu être envoyés (${failedEmails.length} échecs)`);
          console.warn('Échecs d\'envoi:', failedEmails);
        } else {
          setEmailSuccess(true);
        }
      }
      
      setTimeout(() => {
        onClose();
        setEmailContent('');
        setEmailSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l\'envoi des emails:', err);
      setEmailError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi des emails');
    } finally {
      setSendingEmail(false);
    }
  };

  // Configuration de Jodit
  const editorConfig = {
    readonly: sendingEmail,
    height: 200,
    language: 'fr',
    placeholder: 'Saisissez votre message ici...'
  };

  // Fermer le modal et réinitialiser
  const handleClose = () => {
    onClose();
    setEmailContent('');
    setEmailError(null);
    setEmailSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-xl shadow-lg w-full max-w-2xl backdrop-blur-sm max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Envoyer un email aux participants
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={sendingEmail}
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message à envoyer
            </label>
            
            {/* Éditeur Jodit */}
            <JoditEditor
              value={emailContent}
              config={editorConfig}
              onBlur={(newContent: string) => {
                editorRef.current = newContent;
                setEmailContent(newContent);
              }}
              // On utilise seulement onBlur pour éviter les re-rendus pendant la frappe
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Ce message sera envoyé à {participantCount} participant(s)
            </p>
          </div>

          {emailError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">{emailError}</p>
            </div>
          )}

          {emailSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">✅ Emails envoyés avec succès !</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={sendingEmail}
          >
            Annuler
          </button>
          <button
            onClick={sendEmailsToParticipants}
            disabled={sendingEmail || !emailContent.trim()}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendingEmail ? 'Envoi en cours...' : 'Envoyer les emails'}
          </button>
        </div>
      </div>
    </div>
  );
};