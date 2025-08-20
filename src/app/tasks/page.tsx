'use client';
import { useState, useEffect } from 'react';
import { MeetingCard, type Meeting } from './components/MeetingCard';
import { MeetingListItem } from './components/MeetingListItem';
import { MeetingForm } from './components/MeetingForm';
import { MeetingDetails } from './components/MeetingDetails';
import { UserProfile } from '../../components/ui/UserProfile';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/lib/auth';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function TasksPage() {
  const { user, logout } = useAuth();
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        
        // Vérifier si l'utilisateur est connecté
        const currentUser = AuthService.getUser();
        const token = AuthService.getToken();
        console.log('=== DÉBUT FETCH MEETINGS ===');
        console.log('Current user:', currentUser);
        console.log('Token present:', !!token);
        console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'null');
        console.log('Token valide:', AuthService.validateToken());
        
        // Vérifier si le token est expiré
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
            console.log('Token expiration:', new Date(payload.exp * 1000));
            console.log('Current time:', new Date());
            console.log('Token expired:', payload.exp * 1000 < Date.now());
            
            // Si le token est expiré, déconnecter et rediriger
            if (payload.exp * 1000 < Date.now()) {
              console.log('Token expiré, déconnexion...');
              AuthService.logout();
              setError('Session expirée. Veuillez vous reconnecter.');
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
              return;
            }
          } catch (e) {
            console.log('Cannot parse token:', e);
          }
        } else {
          // Pas de token, rediriger vers la connexion
          console.log('Pas de token, redirection vers login...');
          setError('Veuillez vous connecter');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        const authHeaders = AuthService.getAuthHeaders();
        console.log('Auth headers:', authHeaders);
        
        console.log('Envoi de la requête vers /meetings...');
        const response = await fetch('http://localhost:3001/meetings', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        });
        
        console.log('Réponse reçue:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          console.log('Response status:', response.status);
          
          // Si c'est une erreur 401, afficher simplement l'erreur sans déconnecter
          if (response.status === 401) {
            console.log('Erreur 401 détectée (token invalide ou expiré)');
            setError('Erreur d\'authentification. Le token est peut-être invalide ou expiré.');
            return;
          }
          
          // Essayer de récupérer le message d'erreur du backend
          try {
            const errorData = await response.text();
            console.log('Error response:', errorData);
          } catch (e) {
            console.log('Cannot read error response');
          }
          
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        console.log('Requête réussie, traitement de la réponse...');

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Réponse non-JSON reçue de l\'API');
        }

        const data = await response.json();
        console.log('Données reçues:', data.length, 'réunions');
        setMeetings(data);
        setError(null);
        console.log('=== FIN FETCH MEETINGS SUCCÈS ===');
      } catch (err) {
        console.log('=== FIN FETCH MEETINGS ERREUR ===');
        setError(err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des réunions');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [refreshKey]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);

  // Données utilisateur connecté
  const currentUser = {
    id: user?.id?.toString() || "1",
    name: user?.name || "Utilisateur",
    role: user?.role || "Utilisateur",
    email: user?.email || "",
    avatar: user?.avatar // Utiliser l'avatar réel de l'utilisateur
  };

  // Handlers pour le profil utilisateur
  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    console.log("Ouverture des paramètres...");
    // Navigation vers les paramètres
    // Exemple: router.push('/settings');
  };

  // Navigation vers les détails
  const handleView = (meetingId: number) => {
    setSelectedMeetingId(meetingId);
  };

  // Retour à la liste depuis les détails
  const handleBack = () => {
    setSelectedMeetingId(null);
  };

  // Suppression d'une réunion
  const handleDelete = async (meetingId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      setMeetings(meetings.filter(m => m.id !== meetingId));
      if (selectedMeetingId === meetingId) {
        setSelectedMeetingId(null);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  // Génération QR Code
  const handleGenerateQR = (meetingId: number) => {
    console.log('Generate QR for meeting ID:', meetingId);
    // Ici tu peux ajouter la logique pour générer le QR code
  };

  // Liste de présence
  const handleAttendanceList = (meetingId: number) => {
    console.log('Attendance list for meeting ID:', meetingId);
    // Ici tu peux ajouter la logique pour la liste de présence
  };

  // Création d'une nouvelle réunion
  const handleCreateNew = () => {
    setCurrentMeeting({
      id: 0,
      title: '',
      description: '',
      status: 'inactive',
      start_date: new Date().toISOString().slice(0, 16),
      location: '',
      max_participants: 10,
      uniqueCode: ''
    });
    setShowForm(true);
  };

  // Sauvegarde d'une réunion (création ou modification depuis la liste)
  const handleSaveMeeting = async (meetingData: Meeting) => {
    try {
      setShowForm(false);
      setCurrentMeeting(null);
      
      // Afficher un toast de succès
      setError('Réunion enregistrée avec succès!');
      setTimeout(() => setError(null), 1000);
      
      // Rafraîchir les données depuis l'API
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Erreur:', err);
      let errorMessage = 'Erreur lors de la sauvegarde';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // On garde le formulaire ouvert pour corriger les erreurs
    }
  };

  // Modification depuis la liste (ouvre le formulaire)
  const handleEdit = (meetingId: number) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      setCurrentMeeting(meeting);
      setShowForm(true);
      // Fermer la vue détails si elle est ouverte
      setSelectedMeetingId(null);
    }
  };

  // Modification depuis les détails (met à jour directement)
  const handleEditFromDetails = (meetingId: number) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      setCurrentMeeting(meeting);
      setShowForm(true);
    }
  };

  // Filtrage des réunions
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Si un meeting est sélectionné pour voir les détails, afficher seulement les détails
  if (selectedMeetingId) {
    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);
    if (selectedMeeting) {
      return (
        <MeetingDetails
          meeting={selectedMeeting}
          onBack={handleBack}
          onEdit={handleEditFromDetails}
          onAttendanceList={handleAttendanceList}
        />
      );
    }
  }

  // Page principale avec formulaire optionnel
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24 pt-8 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header avec profil utilisateur */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Réunions</h1>
              <p className="text-gray-600">Organisez et gérez vos réunions gouvernementales</p>
            </div>
            
            {/* Profil utilisateur en haut à droite */}
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
            />
          </div>

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
                    <option value="active">Actif</option>
                    <option value="completed">Terminé</option>
                    <option value="inactive">En attente</option>
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

          {/* Affichage conditionnel selon l'état */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-gray-300 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className={`text-lg mb-2 ${
                error.includes('succès')
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {error.includes('succès') ? 'Succès' : 'Erreur'}
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              {!error.includes('succès') && (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Réessayer
                  </button>
                  {error.includes('expirée') && (
                    <button
                      onClick={() => {
                        AuthService.clearAllAuthData();
                        window.location.href = '/login';
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Nettoyer et reconnecter
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : filteredMeetings.length === 0 ? (
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
                      onAttendanceList={handleAttendanceList}
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
                        onAttendanceList={handleAttendanceList}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Formulaire d'édition/création */}
      {showForm && currentMeeting && (
        <MeetingForm
          initialData={currentMeeting}
          onSave={handleSaveMeeting}
          onCancel={() => {
            setShowForm(false);
            setCurrentMeeting(null);
          }}
        />
      )}
    </AuthGuard>
  );
}
