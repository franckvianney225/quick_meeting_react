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
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { MeetingCard, type Meeting } from '@/app/tasks/components/MeetingCard';
import { MeetingListItem } from '@/app/tasks/components/MeetingListItem';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                          (meeting.location || '').toLowerCase().includes(searchTerm.toLowerCase());
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

      {/* Barre de filtres avec toggle vue */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Toutes les réunions</h2>
            <p className="text-gray-600 text-sm">Gestion complète de toutes les réunions du système</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
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

            {/* Toggle Vue Grille/Liste */}
            <div className="flex items-center bg-gray-100/80 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Vue grille"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Vue liste"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage conditionnel selon l'état */}
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
        <>
          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onView={onViewMeeting || (() => {})}
                  onEdit={onEditMeeting || (() => {})}
                  onDelete={handleDeleteMeeting}
                  onAttendanceList={() => {}}
                />
              ))}
            </div>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              <table className="w-full table-fixed">
                {/* Header du tableau */}
                <thead>
                  <tr className="bg-gradient-to-r from-orange-50/80 to-green-50/80 border-b border-orange-200/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-3/12">Réunion</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-2/12">Date création</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-2/12">Lieu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-1/12">Participants</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-1/12">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-2/12">Actions</th>
                  </tr>
                </thead>

                {/* Liste des réunions */}
                <tbody>
                  {filteredMeetings.map((meeting) => (
                    <MeetingListItem
                      key={meeting.id}
                      meeting={meeting}
                      onView={onViewMeeting || (() => {})}
                      onEdit={onEditMeeting || (() => {})}
                      onDelete={handleDeleteMeeting}
                      onAttendanceList={() => {}}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}