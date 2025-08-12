'use client';
import { useState } from 'react';
import { MeetingCard, type Meeting } from './components/MeetingCard';
import { MeetingListItem } from './components/MeetingListItem';
import { MeetingForm } from './components/MeetingForm';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function TasksPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: "Réunion Budget 2024",
      description: "Discussion sur le budget ministériel",
      status: "active",
      start_date: "2024-08-15T14:00:00",
      location: "Salle de conférence A",
      max_participants: 20,
      unique_code: "BDG2024"
    },
    {
      id: 2,
      title: "Formation Sécurité",
      description: "Formation sur les bonnes pratiques",
      status: "completed",
      start_date: "2024-08-12T09:00:00",
      location: "Amphithéâtre",
      max_participants: 50,
      unique_code: "SEC2024"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const handleView = (meeting: Meeting) => {
    console.log('View meeting:', meeting);
  };

  const handleDelete = (meeting: Meeting) => {
    if (confirm(`Supprimer "${meeting.title}" ?`)) {
      setMeetings(meetings.filter(m => m.id !== meeting.id));
    }
  };

  const handleGenerateQR = (meeting: Meeting) => {
    console.log('Generate QR for:', meeting);
  };

  const handleCreateNew = () => {
    setCurrentMeeting({
      id: 0,
      title: '',
      description: '',
      status: 'active',
      start_date: new Date().toISOString().slice(0, 16),
      location: '',
      max_participants: 10,
      unique_code: ''
    });
    setShowForm(true);
  };

  const handleSaveMeeting = (meetingData: Omit<Meeting, 'id'>) => {
    if (currentMeeting) {
      setMeetings(meetings.map(m => 
        m.id === currentMeeting.id ? { ...m, ...meetingData } : m
      ));
    } else {
      const newMeeting = {
        ...meetingData,
        id: Math.max(...meetings.map(m => m.id), 0) + 1
      };
      setMeetings([...meetings, newMeeting]);
    }
    setShowForm(false);
  };

  const handleEdit = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setShowForm(true);
  };

  const confirmDelete = () => {
    if (meetingToDelete) {
      setMeetings(meetings.filter(m => m.id !== meetingToDelete.id));
      setMeetingToDelete(null);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {showForm && currentMeeting && (
        <MeetingForm
          initialData={currentMeeting}
          onSave={handleSaveMeeting}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="min-h-screen bg-gray-50 pb-24 pt-8 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Réunions</h1>
          <p className="text-gray-600 mb-6">Organisez et gérez vos réunions gouvernementales</p>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{meetings.length}</div>
              <div className="text-gray-600 text-sm">Total Réunions</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">
                {meetings.filter(m => m.status === 'active').length}
              </div>
              <div className="text-gray-600 text-sm">Réunions Actives</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-orange-600">
                {meetings.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-gray-600 text-sm">Terminées</div>
            </div>
          </div>

          {/* Barre de filtres avec toggle vue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 md:max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une réunion..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="flex items-center space-x-4">
                {/* Toggle Vue Grille/Liste */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-orange-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Vue grille"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-orange-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Vue liste"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Active</option>
                    <option value="completed">Terminée</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateNew}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="font-medium">Nouvelle Réunion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Affichage conditionnel selon le mode de vue */}
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Aucune réunion trouvée</div>
              <p className="text-gray-600">
                {searchTerm || statusFilter 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Créez votre première réunion pour commencer'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Vue Grille */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onGenerateQR={handleGenerateQR}
                    />
                  ))}
                </div>
              )}

              {/* Vue Liste */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header du tableau */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                      <div className="md:col-span-2">Réunion</div>
                      <div>Date</div>
                      <div>Lieu</div>
                      <div>Participants</div>
                    </div>
                  </div>
                  
                  {/* Liste des réunions */}
                  <div>
                    {filteredMeetings.map((meeting) => (
                      <MeetingListItem
                        key={meeting.id}
                        meeting={meeting}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onGenerateQR={handleGenerateQR}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {meetingToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 rounded-xl shadow-lg w-full max-w-md p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              {`Êtes-vous sûr de vouloir supprimer "${meetingToDelete.title}" ? Cette action est irréversible.`}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMeetingToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}