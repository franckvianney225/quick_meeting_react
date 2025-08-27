'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SystemMetrics, HistoricalData, SystemMonitoringState, mockHistoricalData, ChartConfig } from '@/types/system-monitoring';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/storage';

const MAX_HISTORY_LENGTH = 100; // Nombre maximum de points de données à conserver
const DEFAULT_REFRESH_INTERVAL = 5000; // 5 secondes

interface UseSystemMonitoringOptions {
  refreshInterval?: number;
  maxHistory?: number;
  useMockData?: boolean;
}

export const useSystemMonitoring = (options: UseSystemMonitoringOptions = {}) => {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    maxHistory = MAX_HISTORY_LENGTH,
    useMockData = false
  } = options;

  const [state, setState] = useState<SystemMonitoringState>(() => {
    // Charger les données depuis le stockage local au démarrage
    const savedMetrics = StorageService.loadMetrics();
    const savedConfig = StorageService.loadConfig();
    const savedAlerts = StorageService.loadAlerts();

    return {
      currentMetrics: savedMetrics.length > 0 ? savedMetrics[savedMetrics.length - 1] : null,
      historicalData: {
        metrics: savedMetrics,
        timeRange: {
          start: savedMetrics[0]?.timestamp || 0,
          end: savedMetrics[savedMetrics.length - 1]?.timestamp || 0
        }
      },
      alerts: savedAlerts,
      config: savedConfig || {
        type: 'line',
        metrics: ['cpu.usage', 'memory.usage'],
        timeRange: { value: 30, unit: 'minutes' },
        refreshInterval
      },
      isLoading: savedMetrics.length === 0,
      lastUpdated: 0
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSystemMetrics = useCallback(async (): Promise<SystemMetrics | null> => {
    try {
      if (useMockData) {
        // Données simulées pour le développement
        return {
          timestamp: Date.now(),
          cpu: {
            usage: Math.random() * 30 + 20, // 20-50%
            cores: 4,
            loadAverage: [Math.random() * 2, Math.random() * 1.5, Math.random() * 1]
          },
          memory: {
            total: 8589934592, // 8GB
            used: Math.floor(Math.random() * 4294967296 + 2147483648), // 2-6GB
            free: 0,
            usage: 0
          },
          database: {
            connections: Math.floor(Math.random() * 10 + 5),
            size: 536870912, // 512MB
            queries: Math.floor(Math.random() * 100 + 50)
          },
          network: {
            in: Math.floor(Math.random() * 1000000 + 500000),
            out: Math.floor(Math.random() * 500000 + 250000)
          }
        };
      }

      const response = await fetch(apiUrl('/admin/system/metrics'), {
        headers: AuthService.getAuthHeaders(),
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      return null;
    }
  }, [useMockData]);

  const updateMetrics = useCallback(async () => {
    const metrics = await fetchSystemMetrics();
    
    if (metrics) {
      // Calculer l'utilisation mémoire si nécessaire
      if (metrics.memory.usage === 0 && metrics.memory.total > 0) {
        metrics.memory.usage = (metrics.memory.used / metrics.memory.total) * 100;
        metrics.memory.free = metrics.memory.total - metrics.memory.used;
      }

      setState(prev => {
        const newMetrics = [...prev.historicalData.metrics, metrics];
        
        // Limiter l'historique à maxHistory points
        const trimmedMetrics = newMetrics.length > maxHistory
          ? newMetrics.slice(-maxHistory)
          : newMetrics;

        const optimizedMetrics = StorageService.optimizeStorage(trimmedMetrics);
        
        // Sauvegarder dans le stockage local
        StorageService.saveMetrics(optimizedMetrics);

        const newState = {
          ...prev,
          currentMetrics: metrics,
          historicalData: {
            metrics: optimizedMetrics,
            timeRange: {
              start: optimizedMetrics[0]?.timestamp || 0,
              end: optimizedMetrics[optimizedMetrics.length - 1]?.timestamp || 0
            }
          },
          isLoading: false,
          lastUpdated: Date.now()
        };

        // Sauvegarder la configuration si elle a changé
        if (JSON.stringify(prev.config) !== JSON.stringify(newState.config)) {
          StorageService.saveConfig(newState.config);
        }

        return newState;
      });

      // Vérifier les alertes de performance
      checkPerformanceAlerts(metrics);
    }
  }, [fetchSystemMetrics, maxHistory]);

  const checkPerformanceAlerts = useCallback((metrics: SystemMetrics) => {
    const newAlerts: typeof state.alerts = [];

    // Alertes CPU
    if (metrics.cpu.usage > 85) {
      newAlerts.push({
        id: `cpu-critical-${Date.now()}`,
        metric: 'cpu',
        threshold: 85,
        condition: 'above',
        message: `Utilisation CPU critique: ${Math.round(metrics.cpu.usage)}%`,
        severity: 'critical',
        triggeredAt: Date.now()
      });
    } else if (metrics.cpu.usage > 70) {
      newAlerts.push({
        id: `cpu-warning-${Date.now()}`,
        metric: 'cpu',
        threshold: 70,
        condition: 'above',
        message: `Utilisation CPU élevée: ${Math.round(metrics.cpu.usage)}%`,
        severity: 'warning',
        triggeredAt: Date.now()
      });
    }

    // Alertes Mémoire
    if (metrics.memory.usage > 90) {
      newAlerts.push({
        id: `memory-critical-${Date.now()}`,
        metric: 'memory',
        threshold: 90,
        condition: 'above',
        message: `Utilisation mémoire critique: ${Math.round(metrics.memory.usage)}%`,
        severity: 'critical',
        triggeredAt: Date.now()
      });
    } else if (metrics.memory.usage > 75) {
      newAlerts.push({
        id: `memory-warning-${Date.now()}`,
        metric: 'memory',
        threshold: 75,
        condition: 'above',
        message: `Utilisation mémoire élevée: ${Math.round(metrics.memory.usage)}%`,
        severity: 'warning',
        triggeredAt: Date.now()
      });
    }

    if (newAlerts.length > 0) {
      setState(prev => {
        const updatedAlerts = [...prev.alerts, ...newAlerts].slice(-10);
        // Sauvegarder les alertes
        StorageService.saveAlerts(updatedAlerts);
        return { ...prev, alerts: updatedAlerts };
      });
    }
  }, []);

  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Premier appel immédiat
    updateMetrics();

    intervalRef.current = setInterval(updateMetrics, refreshInterval);
  }, [refreshInterval, updateMetrics]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshNow = useCallback(() => {
    return updateMetrics();
  }, [updateMetrics]);

  const clearAlerts = useCallback(() => {
    setState(prev => {
      StorageService.saveAlerts([]);
      return { ...prev, alerts: [] };
    });
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ChartConfig>) => {
    setState(prev => {
      const updatedConfig = { ...prev.config, ...newConfig };
      StorageService.saveConfig(updatedConfig);
      return { ...prev, config: updatedConfig };
    });
  }, []);

  // Effet de nettoyage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    refreshNow,
    clearAlerts,
    updateConfig,
    isMonitoring: intervalRef.current !== null
  };
};