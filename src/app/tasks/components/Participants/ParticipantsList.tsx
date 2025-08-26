'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  UsersIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';

export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  function: string;
  organization: string;
  submittedAt?: string | null;
  signatureDate?: string | null;
  createdAt?: string | null;
  registeredAt?: string | null;
  location?: string | null;
}

interface ParticipantsListProps {
  meetingId: number;
  meetingTitle: string;
}

export const ParticipantsList = ({ meetingId, meetingTitle }: ParticipantsListProps) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role && ['admin', 'administrator', 'Admin'].includes(user.role);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/meetings/${meetingId}/participants`), {
          headers: AuthService.getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Réponse non-JSON reçue de l\'API');
        }

        const data = await response.json();
        interface ApiParticipant {
          id: number;
          name: string;
          prenom: string;
          email: string;
          phone: string;
          fonction: string;
          organisation: string;
          createdAt?: string;
          submittedAt?: string;
          signatureDate?: string;
          registeredAt?: string;
          location?: string;
        }

        const mappedParticipants = data.map((p: ApiParticipant) => ({
          id: p.id,
          firstName: p.prenom,
          lastName: p.name,
          email: p.email,
          phone: p.phone,
          function: p.fonction,
          organization: p.organisation,
          submittedAt: p.submittedAt,
          signatureDate: p.signatureDate,
          createdAt: p.createdAt,
          registeredAt: p.signatureDate || p.createdAt || p.submittedAt || p.registeredAt,
          location: p.location
        }));
        setParticipants(mappedParticipants);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [meetingId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filtrer les participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const matchesSearch =
        (participant.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.function?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.organization?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [participants, searchTerm]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

  // Réinitialiser la page quand on fait une recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Supprimer un participant (admin seulement)
  const handleDeleteParticipant = async (participantId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/participants/${participantId}`), {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé. Seuls les administrateurs peuvent supprimer des participants.');
        }
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour la liste localement
      setParticipants(participants.filter(p => p.id !== participantId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const firstInitial = firstName?.[0] || '';
    const lastInitial = lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
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

  const showPagination = filteredParticipants.length > itemsPerPage;

  // Fonction d'exportation CSV
  const exportToCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Fonction', 'Organisation', 'Date de signature', 'Localisation'];
    const csvData = filteredParticipants.map(participant => [
      participant.lastName,
      participant.firstName,
      participant.email,
      participant.phone,
      participant.function,
      participant.organization,
      participant.submittedAt ? formatDate(participant.submittedAt) : 'Non disponible',
      participant.location || 'Non disponible'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction d'exportation XLSX
  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredParticipants.map(participant => ({
        'Nom': participant.lastName,
        'Prénom': participant.firstName,
        'Email': participant.email,
        'Téléphone': participant.phone,
        'Fonction': participant.function,
        'Organisation': participant.organization,
        'Date de signature': participant.submittedAt ? formatDate(participant.submittedAt) : 'Non disponible',
        'Localisation': participant.location || 'Non disponible'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    XLSX.writeFile(workbook, `participants_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* Barre de recherche et actions d'exportation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un participant..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Boutons d'exportation */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            title="Exporter en CSV"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>CSV</span>
          </button>
          
          <button
            onClick={exportToXLSX}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title="Exporter en XLSX"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>XLSX</span>
          </button>
          
          {/* Informations de pagination */}
          {showPagination && (
            <div className="text-sm text-gray-600 ml-4">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredParticipants.length)} sur {filteredParticipants.length} participants
            </div>
          )}
        </div>
      </div>

      {/* Liste des participants */}
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
          <div className="text-red-500 text-lg mb-2">Erreur de chargement</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      ) : currentParticipants.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom et Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonction/Emploi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de signature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  {/* Colonne Actions pour admin seulement */}
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(participant.firstName, participant.lastName)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {participant.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {participant.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {participant.function}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-xs">{participant.organization}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.submittedAt ? formatDate(participant.submittedAt) : 'Non disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.location || 'Non disponible'}
                    </td>
                    
                    {/* Actions pour admin seulement */}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteParticipant(participant.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer le participant"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Suivant</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
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

              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Aucun participant ne correspond à votre recherche' 
              : 'Aucun participant inscrit pour cette réunion'
            }
          </p>
        </div>
      )}
    </div>
  );
};
