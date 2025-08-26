'use client';
import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import {
  ClipboardDocumentIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Meeting {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'inactive';
  start_date: string;
  location: string;
  max_participants: number;
  uniqueCode: string;
  created_at: string;
  participants_count: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

interface AdminMeetingsProps {
  onViewMeeting?: (meetingId: number) => void;
  onEditMeeting?: (meetingId: number) => void;
}

export default function AdminMeetings({ onViewMeeting, onEditMeeting }: AdminMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllMeetings();
  }, []);

  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      console.log('Fetching all meetings for admin...');
      const authHeaders = AuthService.getAuthHeaders();
      console.log('Auth headers:', authHeaders);
      
      const response = await fetch(apiUrl('/meetings/all'), {
        headers: authHeaders
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé. Seuls les administrateurs peuvent accéder à cette page.');
        }
        throw new Error('Erreur lors du chargement des réunions');
      }

      const data = await response.json();
      console.log('Meetings data received:', data.length, 'meetings');
      setMeetings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réunion ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/meetings/${meetingId}`), {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setMeetings(meetings.filter(m => m.id !== meetingId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (meeting.creator?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (meeting.creator?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des réunions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardDocumentIcon className="w-8 h-8 text-white" />
        </div>
        <p className="text-red-500 text-lg mb-2">Erreur</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAllMeetings}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl hover:from-orange-600 hover:to-green-700 transition-all duration-300 font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Composant pour les cartes de statistiques
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Calculer les statistiques
  const totalParticipants = meetings.reduce((sum, meeting) => sum + (meeting.participants_count || 0), 0);
  const activeMeetings = meetings.filter(m => m.status === 'active').length;
  const inactiveMeetings = meetings.filter(m => m.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toutes les réunions"
          value={meetings.length}
          icon={ClipboardDocumentIcon}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total participants"
          value={totalParticipants}
          icon={UsersIcon}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Réunions actives"
          value={activeMeetings}
          icon={CheckCircleIcon}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Réunions inactives"
          value={inactiveMeetings}
          icon={ClockIcon}
          color="bg-gradient-to-r from-gray-500 to-gray-600"
        />
      </div>

      {/* Tableau des réunions */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
        {/* Header avec filtres */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50/80 to-green-50/80 border-b border-orange-200/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Toutes les réunions</h2>
              <p className="text-gray-600 text-sm">Gestion complète de toutes les réunions du système</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="inactive">En attente</option>
              </select>
            </div>
          </div>
        </div>

      {filteredMeetings.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ClipboardDocumentIcon className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-500 text-xl font-medium">Aucune réunion trouvée</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || statusFilter
              ? 'Essayez de modifier vos critères de recherche'
              : 'Aucune réunion n\'a été créée dans le système'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Titre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Créateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date création</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Participants</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{meeting.title}</div>
                    <div className="text-sm text-gray-500">{meeting.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {meeting.creator?.name || 'Inconnu'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {meeting.creator?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(meeting.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {meeting.participants_count} / {meeting.max_participants}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : meeting.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {meeting.status === 'active' ? 'Actif' : meeting.status === 'completed' ? 'Terminé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {onViewMeeting && (
                        <button
                          onClick={() => onViewMeeting(meeting.id)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                      {onEditMeeting && (
                        <button
                          onClick={() => onEditMeeting(meeting.id)}
                          className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la réunion"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}