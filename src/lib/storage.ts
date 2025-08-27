/**
 * Service de stockage local pour les données de monitoring système
 * Utilise localStorage avec compression et expiration automatique
 */

const STORAGE_KEYS = {
  SYSTEM_METRICS: 'system_metrics_history',
  MONITORING_CONFIG: 'system_monitoring_config',
  PERFORMANCE_ALERTS: 'system_performance_alerts',
  LAST_UPDATED: 'system_data_last_updated'
} as const;

const MAX_STORAGE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
const MAX_METRICS_COUNT = 1000; // Maximum de points de données à conserver

import { SystemMetrics, PerformanceAlert, ChartConfig } from '@/types/system-monitoring';

interface StoredMetrics {
  timestamp: number;
  data: SystemMetrics[];
  version: string;
}

interface StoredConfig {
  config: ChartConfig;
  savedAt: number;
}

interface StoredAlerts {
  alerts: PerformanceAlert[];
  savedAt: number;
}

export const StorageService = {
  // Sauvegarder les métriques dans le stockage local
  saveMetrics: (metrics: SystemMetrics[]): void => {
    try {
      const dataToStore: StoredMetrics = {
        timestamp: Date.now(),
        data: metrics,
        version: '1.0'
      };

      localStorage.setItem(STORAGE_KEYS.SYSTEM_METRICS, JSON.stringify(dataToStore));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
    } catch (error) {
      console.warn('Impossible de sauvegarder les métriques dans le stockage local:', error);
    }
  },

  // Charger les métriques depuis le stockage local
  loadMetrics: (): SystemMetrics[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYSTEM_METRICS);
      if (!stored) return [];

      const parsed: StoredMetrics = JSON.parse(stored);
      
      // Vérifier l'expiration des données
      const dataAge = Date.now() - parsed.timestamp;
      if (dataAge > MAX_STORAGE_AGE) {
        localStorage.removeItem(STORAGE_KEYS.SYSTEM_METRICS);
        return [];
      }

      return parsed.data || [];
    } catch (error) {
      console.warn('Erreur lors du chargement des métriques:', error);
      return [];
    }
  },

  // Sauvegarder la configuration de monitoring
  saveConfig: (config: ChartConfig): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONITORING_CONFIG, JSON.stringify({
        ...config,
        savedAt: Date.now()
      }));
    } catch (error) {
      console.warn('Impossible de sauvegarder la configuration:', error);
    }
  },

  // Charger la configuration de monitoring
  loadConfig: (): ChartConfig | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MONITORING_CONFIG);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Erreur lors du chargement de la configuration:', error);
      return null;
    }
  },

  // Sauvegarder les alertes de performance
  saveAlerts: (alerts: PerformanceAlert[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PERFORMANCE_ALERTS, JSON.stringify({
        alerts,
        savedAt: Date.now()
      }));
    } catch (error) {
      console.warn('Impossible de sauvegarder les alertes:', error);
    }
  },

  // Charger les alertes de performance
  loadAlerts: (): PerformanceAlert[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PERFORMANCE_ALERTS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      const dataAge = Date.now() - parsed.savedAt;
      
      // Supprimer les alertes trop anciennes (24h)
      if (dataAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEYS.PERFORMANCE_ALERTS);
        return [];
      }

      return parsed.alerts || [];
    } catch (error) {
      console.warn('Erreur lors du chargement des alertes:', error);
      return [];
    }
  },

  // Nettoyer les données anciennes
  cleanupOldData: (): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYSTEM_METRICS);
      if (stored) {
        const parsed: StoredMetrics = JSON.parse(stored);
        const dataAge = Date.now() - parsed.timestamp;
        
        if (dataAge > MAX_STORAGE_AGE) {
          localStorage.removeItem(STORAGE_KEYS.SYSTEM_METRICS);
        }
      }

      // Nettoyer les alertes expirées
      const alerts = StorageService.loadAlerts();
      const recentAlerts = alerts.filter((alert: PerformanceAlert) =>
        alert.triggeredAt && (Date.now() - alert.triggeredAt) <= 24 * 60 * 60 * 1000
      );
      
      if (recentAlerts.length !== alerts.length) {
        StorageService.saveAlerts(recentAlerts);
      }

    } catch (error) {
      console.warn('Erreur lors du nettoyage des données:', error);
    }
  },

  // Obtenir les statistiques de stockage
  getStorageStats: (): { size: number; count: number; lastUpdated: number } => {
    try {
      const metrics = StorageService.loadMetrics();
      const lastUpdated = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_UPDATED) || '0');
      
      return {
        size: JSON.stringify(metrics).length,
        count: metrics.length,
        lastUpdated
      };
    } catch (error) {
      return { size: 0, count: 0, lastUpdated: 0 };
    }
  },

  // Vider toutes les données de monitoring
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SYSTEM_METRICS);
      localStorage.removeItem(STORAGE_KEYS.MONITORING_CONFIG);
      localStorage.removeItem(STORAGE_KEYS.PERFORMANCE_ALERTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
    } catch (error) {
      console.warn('Erreur lors de la suppression des données:', error);
    }
  },

  // Vérifier si le stockage est disponible
  isAvailable: (): boolean => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Optimiser le stockage en limitant le nombre de métriques
  optimizeStorage: (metrics: SystemMetrics[]): SystemMetrics[] => {
    if (metrics.length <= MAX_METRICS_COUNT) {
      return metrics;
    }

    // Réduire la résolution des données anciennes
    const recentData = metrics.slice(-500); // Garder 500 points récents en haute résolution
    const oldData = metrics.slice(0, -500);
    
    // Réduire les données anciennes à 1 point par heure
    const optimizedOldData = oldData.filter((point, index) => {
      if (index === 0) return true;
      
      const prevPoint = oldData[index - 1];
      const timeDiff = point.timestamp - prevPoint.timestamp;
      return timeDiff >= 60 * 60 * 1000; // 1 heure
    });

    return [...optimizedOldData, ...recentData].slice(-MAX_METRICS_COUNT);
  }
};