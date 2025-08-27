'use client';
import { useState, useCallback } from 'react';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';

export interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  status: 'success' | 'failed' | 'pending';
  type: 'manual' | 'automatic';
  description?: string;
  filename?: string;
  path?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface BackupStats {
  totalBackups: number;
  totalSize: string;
  lastBackup: string | null;
  successRate: number;
}

interface UseBackupOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useBackup = (options: UseBackupOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BackupStats>({
    totalBackups: 0,
    totalSize: '0 Bytes',
    lastBackup: null,
    successRate: 100
  });

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Appel API réel
      const response = await fetch(apiUrl('/backup'), {
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des sauvegardes');
      }

      const backupsData: Backup[] = await response.json();
      setBackups(backupsData);

      // Récupérer les statistiques
      const statsResponse = await fetch(apiUrl('/backup/stats'), {
        headers: AuthService.getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalBackups: statsData.totalBackups,
          totalSize: statsData.totalSize,
          lastBackup: statsData.lastBackup,
          successRate: statsData.successRate
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sauvegardes');
      console.error('Erreur backup:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(async (type: 'full' | 'incremental' = 'full', description?: string) => {
    try {
      setLoading(true);
      
      // Appel API réel
      const response = await fetch(apiUrl('/backup'), {
        method: 'POST',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, description })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur lors de la création de la sauvegarde: ${response.status} ${errorData}`);
      }

      const newBackup: Backup = await response.json();
      
      // Mettre à jour la liste locale
      setBackups(prev => [newBackup, ...prev]);
      
      // Rafraîchir les statistiques
      const statsResponse = await fetch(apiUrl('/backup/stats'), {
        headers: AuthService.getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      return newBackup;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la sauvegarde');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreBackup = useCallback(async (backupId: number) => {
    try {
      setLoading(true);
      
      // Appel API réel
      const response = await fetch(apiUrl(`/backup/${backupId}/restore`), {
        method: 'POST',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la restauration');
      }

      const result = await response.json();
      return result;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la restauration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: number) => {
    try {
      // Appel API réel
      const response = await fetch(apiUrl(`/backup/${backupId}`), {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour la liste locale
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      
      // Rafraîchir les statistiques
      const statsResponse = await fetch(apiUrl('/backup/stats'), {
        headers: AuthService.getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  }, []);

  const downloadBackup = useCallback(async (backupId: number) => {
    try {
      // Générer le lien de téléchargement via l'API
      const downloadUrl = apiUrl(`/backup/${backupId}/download`);
      
      // Ouvrir dans une nouvelle fenêtre pour déclencher le téléchargement
      window.open(downloadUrl, '_blank');
      
      return downloadUrl;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
      throw err;
    }
  }, []);

  const getBackupStats = useCallback(() => stats, [stats]);

  return {
    backups,
    loading,
    error,
    stats,
    fetchBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    getBackupStats
  };
};