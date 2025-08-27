'use client';
import { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ServerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useBackup } from '@/hooks/useBackup';

export const BackupSection = () => {
  const {
    backups,
    loading,
    error,
    stats,
    fetchBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup
  } = useBackup({ autoRefresh: true });

  const [isCreating, setIsCreating] = useState(false);
  const [backupType, setBackupType] = useState<'full' | 'incremental'>('full');
  const [backupDescription, setBackupDescription] = useState('');

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      await createBackup(backupType, backupDescription);
      setBackupDescription('');
    } catch (err) {
      console.error('Erreur création backup:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadBackup = async (backupId: number) => {
    try {
      const downloadUrl = await downloadBackup(backupId);
      // Simuler le téléchargement
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Erreur téléchargement:', err);
    }
  };

  const handleDeleteBackup = async (backupId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.')) {
      try {
        await deleteBackup(backupId);
      } catch (err) {
        console.error('Erreur suppression:', err);
      }
    }
  };

  const handleRestoreBackup = async (backupId: number) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    if (confirm(`Êtes-vous sûr de vouloir restaurer la sauvegarde du ${new Date(backup.date).toLocaleDateString()} ? Cette action écrasera les données actuelles.`)) {
      try {
        await restoreBackup(backupId);
        alert('Restauration terminée avec succès !');
      } catch (err) {
        console.error('Erreur restauration:', err);
        alert('Erreur lors de la restauration');
      }
    }
  };

  return (
    <div className="p-8">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sauvegardes</h2>
          <p className="text-gray-600">Gérez les sauvegardes de vos données</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Statistiques rapides */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.totalBackups}</div>
              <div>Sauvegardes</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.totalSize}</div>
              <div>Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.successRate}%</div>
              <div>Réussite</div>
            </div>
          </div>

          <button
            onClick={fetchBackups}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            title="Actualiser"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={isCreating || loading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <CloudArrowUpIcon className="w-4 h-4" />
            <span>{isCreating ? 'Création...' : 'Nouvelle sauvegarde'}</span>
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Statistiques détaillées avec indicateurs visuels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center relative">
          <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalBackups}</div>
          <div className="text-sm text-gray-600">Sauvegardes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center relative">
          <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalSize}</div>
          <div className="text-sm text-gray-600">Taille totale</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center relative">
          <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          <div className="text-sm text-gray-600">Taux de réussite</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center relative">
          <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full"></div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Dernière sauvegarde</div>
        </div>
      </div>

      {/* Configuration et création de sauvegarde */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Configuration automatique */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
            Sauvegarde automatique
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option>Quotidienne</option>
                <option>Hebdomadaire</option>
                <option>Mensuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
              <input
                type="time"
                defaultValue="02:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rétention (jours)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Création manuelle */}
        <div className="p-6 bg-orange-50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde manuelle</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de sauvegarde</label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value as 'full' | 'incremental')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="full">Complète</option>
                <option value="incremental">Incrémentielle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
              <input
                type="text"
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                placeholder="Description de la sauvegarde"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {isCreating ? 'Création en cours...' : 'Créer la sauvegarde'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des sauvegardes */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                    Chargement des sauvegardes...
                  </div>
                </td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucune sauvegarde disponible
                </td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ServerIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {backup.size}
                      <span className={`ml-2 w-2 h-2 rounded-full ${
                        backup.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        backup.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {backup.status === 'success' ? 'Réussie' : 'Échouée'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {backup.type === 'manual' ? 'Manuelle' : 'Automatique'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownloadBackup(backup.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Télécharger"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                        title="Restaurer"
                      >
                        Restaurer
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Informations d'utilisation avec meilleures pratiques */}
      <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
          Meilleures pratiques de sauvegarde
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">1</span>
            </div>
            <div>
              <strong>Sauvegardes complètes :</strong> Recommandées pour une protection complète des données
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">2</span>
            </div>
            <div>
              <strong>Sauvegardes incrémentielles :</strong> Plus rapides, moins d&apos;espace utilisé
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">3</span>
            </div>
            <div>
              <strong>Fréquence :</strong> Sauvegardez quotidiennement pour les données critiques
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">4</span>
            </div>
            <div>
              <strong>Stockage :</strong> Conservez les sauvegardes hors site pour plus de sécurité
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};