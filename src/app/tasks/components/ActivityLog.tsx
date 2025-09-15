'use client';
import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';
import { ClockIcon, UserIcon, DocumentTextIcon, QrCodeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface ActivityLog {
  id: number;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ActivityLogProps {
  meetingId: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'meeting_created':
      return <DocumentTextIcon className="h-4 w-4 text-green-600" />;
    case 'meeting_updated':
      return <DocumentTextIcon className="h-4 w-4 text-blue-600" />;
    case 'meeting_closed':
    case 'meeting_auto_closed':
      return <ClipboardDocumentListIcon className="h-4 w-4 text-red-600" />;
    case 'meeting_reopened':
      return <ClipboardDocumentListIcon className="h-4 w-4 text-green-600" />;
    case 'attendance_list_printed':
      return <ClipboardDocumentListIcon className="h-4 w-4 text-orange-600" />;
    case 'qr_code_printed':
    case 'qr_config_updated':
      return <QrCodeIcon className="h-4 w-4 text-purple-600" />;
    default:
      return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ActivityLog = ({ meetingId }: ActivityLogProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/activity/meeting/${meetingId}`), {
          headers: AuthService.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des logs dactivité');
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [meetingId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal d'activité</h3>
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal d'activité</h3>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal d'activité</h3>
      
      {logs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p>Aucune activité enregistrée pour cette réunion</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <div className="p-1 bg-white rounded-full border border-gray-200">
                  {getActivityIcon(log.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {log.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                  
                  {log.user && (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-3 w-3" />
                      <span>{log.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
