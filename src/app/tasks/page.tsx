'use client';
import { useState, useEffect } from 'react';
import { MeetingCard, type Meeting } from './components/MeetingCard';
import { MeetingListItem } from './components/MeetingListItem';
import { MeetingForm } from './components/MeetingForm';
import { MeetingDetails } from './components/MeetingDetails';
import { UserProfile } from '../../components/ui/UserProfile';
import { ErrorModal } from '@/components/ui/ErrorModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<{id: number, title: string} | null>(null);

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
        const response = await fetch(apiUrl('/meetings'), {
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
    
    // Vérifier l'URL pour un meetingId au chargement
    const urlParams = new URLSearchParams(window.location.search);
    const meetingIdFromUrl = urlParams.get('meetingId');
    if (meetingIdFromUrl) {
      setSelectedMeetingId(parseInt(meetingIdFromUrl));
    }

    // Vérifier l'URL pour un filtre de statut au chargement
    const statusFromUrl = urlParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [refreshKey]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    // Mettre à jour l'URL avec le meetingId
    const url = new URL(window.location.href);
    url.searchParams.set('meetingId', meetingId.toString());
    window.history.pushState({}, '', url.toString());
  };

  // Retour à la liste depuis les détails
  const handleBack = () => {
    setSelectedMeetingId(null);
    // Retirer le meetingId de l'URL
    const url = new URL(window.location.href);
    url.searchParams.delete('meetingId');
    window.history.pushState({}, '', url.toString());
  };

  // Gestion de la demande de suppression
  const handleDeleteRequest = (meetingId: number, meetingTitle: string) => {
    setMeetingToDelete({ id: meetingId, title: meetingTitle });
    setShowDeleteModal(true);
  };

  // Confirmation de suppression
  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    
    try {
      const response = await fetch(apiUrl(`/meetings/${meetingToDelete.id}`), {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        // Essayer de récupérer le message d'erreur du backend
        let errorMessage = 'Erreur lors de la suppression';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Si on ne peut pas parser le JSON, on garde le message par défaut
        }
        
        if (response.status === 409) {
          // Erreur de conflit (réunion avec participants)
          setErrorModalTitle('Impossible de supprimer');
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
          return;
        }
        
        // Pour les autres erreurs, afficher aussi dans le modal
        setErrorModalTitle('Erreur de suppression');
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
        return;
      }

      setMeetings(meetings.filter(m => m.id !== meetingToDelete.id));
      if (selectedMeetingId === meetingToDelete.id) {
        setSelectedMeetingId(null);
      }
    } catch (err) {
      console.error('Erreur:', err);
      // Afficher l'erreur dans un modal doux
      setErrorModalTitle('Erreur de suppression');
      setErrorModalMessage(err instanceof Error ? err.message : 'Erreur inconnue lors de la suppression');
      setShowErrorModal(true);
    } finally {
      setShowDeleteModal(false);
      setMeetingToDelete(null);
    }
  };

  // Annulation de suppression
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMeetingToDelete(null);
  };

  // Suppression d'une réunion (compatibilité arrière)
  const handleDelete = async (meetingId: number) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      handleDeleteRequest(meetingId, meeting.title);
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
      status: 'active',
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
                          meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (meeting.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

  // Réinitialiser la page quand on change les filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  // Fonctions de navigation paginée
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-green-50/80 pb-24 pt-4 w-full relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header avec profil utilisateur */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-black">
                Gestion des Réunions
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Organisez et gérez vos réunions
              </p>
            </div>

            {/* Profil utilisateur en haut à droite */}
            <UserProfile
              user={currentUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Squares2X2Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{meetings.length}</div>
              <div className="text-gray-600 text-sm font-medium">Total Réunions</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <ListBulletIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {meetings.filter(m => m.status === 'active').length}
              </div>
              <div className="text-gray-600 text-sm font-medium">Réunions En cours</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {meetings.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-gray-600 text-sm font-medium">Réunions Terminées</div>
            </div>
          </div>

          {/* Barre de filtres avec toggle vue */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 md:max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black-400" />
                <input
                  type="text"
                  placeholder="Rechercher une réunion, description ou salle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300/30 focus:border-orange-400 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:border-gray-300"
                />
              </div>

              <div className="flex items-center space-x-4">
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

                <div className="flex items-center space-x-3">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-300/30 focus:border-orange-400 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">En cours</option>
                    <option value="completed">Terminé</option>
                    {/* <option value="inactive">En attente</option> */}
                  </select>
                </div>

                {/* Sélecteur d'items par page */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Afficher</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-300/30 focus:border-orange-400 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:border-gray-300 text-sm"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm text-gray-600">par page</span>
                </div>

                <button
                  onClick={handleCreateNew}
                  className="flex items-center space-x-3 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-semibold"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Nouvelle Réunion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Affichage conditionnel selon l'état */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Chargement des réunions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FunnelIcon className="w-8 h-8 text-white" />
              </div>
              <div className={`text-lg mb-2 ${
                error.includes('succès')
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {error.includes('succès') ? 'Succès' : 'Erreur'}
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              {!error.includes('succès') && (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl hover:from-orange-600 hover:to-green-700 transition-all duration-300 font-semibold"
                  >
                    Réessayer
                  </button>
                  {error.includes('expirée') && (
                    <button
                      onClick={() => {
                        AuthService.clearAllAuthData();
                        window.location.href = '/login';
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-sm"
                    >
                      Nettoyer et reconnecter
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ListBulletIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-gray-500 text-xl font-medium">Aucune réunion trouvée</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || statusFilter
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Créez votre première réunion pour commencer'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Informations de pagination */}
              <div className="flex items-center justify-between mb-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <div className="text-sm text-gray-600">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredMeetings.length)} sur {filteredMeetings.length} réunions
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && goToPage(page)}
                          disabled={typeof page !== 'number'}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-orange-600 text-white'
                              : typeof page === 'number'
                              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              : 'text-gray-400 cursor-default'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>

              {/* Vue Grille */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {paginatedMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAttendanceList={handleAttendanceList}
                      onDeleteRequest={handleDeleteRequest}
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
                      {paginatedMeetings.map((meeting) => (
                        <MeetingListItem
                          key={meeting.id}
                          meeting={meeting}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onAttendanceList={handleAttendanceList}
                          onDeleteRequest={handleDeleteRequest}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination en bas */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && goToPage(page)}
                          disabled={typeof page !== 'number'}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-orange-600 text-white'
                              : typeof page === 'number'
                              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              : 'text-gray-400 cursor-default'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
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
    {/* Modal de confirmation de suppression */}
    <ConfirmModal
      isOpen={showDeleteModal}
      title="Supprimer la réunion"
      message={`Êtes-vous sûr de vouloir supprimer définitivement la réunion "${meetingToDelete?.title}" ? Cette action ne peut pas être annulée.`}
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
      confirmText="Oui, supprimer"
      cancelText="Annuler"
      type="danger"
    />
  </AuthGuard>
  );
}
