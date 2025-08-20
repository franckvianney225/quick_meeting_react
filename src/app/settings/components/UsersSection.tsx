'use client';
import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { UserModal } from './Users/UserModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AuthService } from '@/lib/auth';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  last_login?: string;
}

interface UsersSectionProps {
  users: User[];
  setUsers: (users: User[]) => void;
}

export const UsersSection = ({ users, setUsers }: UsersSectionProps) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/users', {
        headers: AuthService.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      
      // Si c'est une erreur de domaine non autorisé, on la retourne pour l'afficher dans le modal
      if (errorMessage.includes('domaine email n\'est pas autorisé')) {
        return { success: false, error: 'Le domaine email n\'est pas autorisé pour la création de compte' };
      }
      
      // Pour les autres erreurs, on les affiche globalement
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleEditUser = async (userData: Omit<User, 'id'> & { password: string }) => {
    if (!editingUser) return { success: false, error: 'Aucun utilisateur à modifier' };

    try {
      const response = await fetch(`http://localhost:3001/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification';
      
      // Si c'est une erreur de domaine non autorisé, on la retourne pour l'afficher dans le modal
      if (errorMessage.includes('domaine email n\'est pas autorisé')) {
        return { success: false, error: 'Le domaine email n\'est pas autorisé pour la création de compte' };
      }
      
      // Pour les autres erreurs, on les affiche globalement
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de statut');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const closeModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset à la première page lors d'une nouvelle recherche
  };


  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 font-medium">Erreur</div>
          <div className="text-red-800">{error}</div>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h2>
            <p className="text-gray-600">Créez et gérez les comptes utilisateurs</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nouvel utilisateur</span>
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total utilisateurs</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'Admin').length}
            </div>
            <div className="text-sm text-gray-600">Administrateurs</div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
              
                      {/* Pagination */}
                      {filteredUsers.length > itemsPerPage && (
                        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
                          <div className="text-sm text-gray-700">
                            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Précédent
                            </button>
                            
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                if (page > totalPages) return null;
                                
                                return (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-8 h-8 text-sm rounded-md transition-colors ${
                                      currentPage === page
                                        ? 'bg-orange-600 text-white'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                              
                              {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              
                              {totalPages > 5 && currentPage < totalPages - 1 && (
                                <button
                                  onClick={() => handlePageChange(totalPages)}
                                  className="w-8 h-8 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  {totalPages}
                                </button>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Suivant
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'Admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.status === 'active' ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                      <span>{user.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? formatLastLogin(user.last_login) : 'Jamais connecté'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setUserToDelete(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <div className="text-gray-400 text-lg mb-2">Aucun utilisateur trouvé</div>
                  <p className="text-gray-600 mb-4">Aucun résultat pour &ldquo;{searchTerm}&rdquo;</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span>Effacer la recherche</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="text-gray-400 text-lg mb-2">Aucun utilisateur</div>
                  <p className="text-gray-600 mb-4">Commencez par créer votre premier utilisateur</p>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Créer un utilisateur</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/édition */}
      <UserModal
        isOpen={showUserModal}
        onClose={closeModal}
        onSave={editingUser ? handleEditUser : handleCreateUser}
        editingUser={editingUser}
      />

      {/* Modal de confirmation de suppression */}
      {userToDelete && (
        <ConfirmModal
          isOpen={!!userToDelete}
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete.name}" ? Cette action est irréversible.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setUserToDelete(null)}
          confirmText="Oui, supprimer"
          cancelText="Annuler"
          type="danger"
        />
      )}
    </>
  );
};

// Fonction pour formater la dernière connexion
function formatLastLogin(dateString: string): string {
  try {
    const lastLoginDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - lastLoginDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      return lastLoginDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
}
