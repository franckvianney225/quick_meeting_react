'use client';
import { useState, useEffect } from 'react';
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { CpuMonitor } from '@/components/system/CpuMonitor';
import { MemoryMonitor } from '@/components/system/MemoryMonitor';

interface SystemStatus {
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    size: number;
    connections: number;
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    version: string;
  }[];
}

export const SystemSection = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  
  const {
    currentMetrics,
    historicalData,
    isLoading: monitoringLoading,
    refreshNow,
    startMonitoring,
    stopMonitoring,
    isMonitoring
  } = useSystemMonitoring({
    refreshInterval: 5000,
    useMockData: true // Utiliser les données simulées en attendant l'API
  });

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Simulation des données en attendant l'implémentation backend
      const mockData: SystemStatus = {
        status: 'online',
        uptime: '15 jours, 8 heures, 23 minutes',
        memory: {
          total: 8589934592, // 8 GB
          used: 3221225472,  // 3 GB
          free: 5368709120   // 5 GB
        },
        cpu: {
          usage: 25,
          cores: 4
        },
        database: {
          status: 'connected',
          size: 536870912, // 512 MB
          connections: 12
        },
        services: [
          { name: 'API Server', status: 'running', version: '2.1.0' },
          { name: 'Database', status: 'running', version: 'PostgreSQL 14.5' },
          { name: 'Cache', status: 'running', version: 'Redis 6.2' },
          { name: 'Email Service', status: 'running', version: '1.0.3' }
        ]
      };

      // Essayer d'abord l'API réelle, puis utiliser les données simulées en cas d'erreur
      try {
        const response = await fetch(apiUrl('/admin/system/status'), {
          headers: AuthService.getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
          return;
        }
      } catch (apiError) {
        console.log('API non disponible, utilisation des données simulées');
      }

      // Utiliser les données simulées
      setSystemStatus(mockData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
      case 'stopped':
      case 'disconnected':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleCharts = () => {
    setShowCharts(!showCharts);
    if (!showCharts) {
      refreshNow();
    }
  };

  if (loading || monitoringLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchSystemStatus}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">État du Système</h2>
        <p className="text-gray-600">Surveillance et informations sur l&apos;infrastructure</p>
      </div>

      {systemStatus && (
        <div className="space-y-8">
          {/* Statut général */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ServerIcon className="w-8 h-8 text-orange-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Statut Général</h3>
                  <p className="text-sm text-gray-600">État global du système</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.status)}`}>
                {systemStatus.status === 'online' ? 'En ligne' : 
                 systemStatus.status === 'degraded' ? 'Dégradé' : 'Hors ligne'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <ClockIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="font-semibold text-gray-900">{systemStatus.uptime}</p>
              </div>
              
              <div className="text-center">
                <CpuChipIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">CPU</p>
                <p className="font-semibold text-gray-900">{systemStatus.cpu.usage}%</p>
                <p className="text-xs text-gray-500">{systemStatus.cpu.cores} cores</p>
              </div>
              
              <div className="text-center">
                <CircleStackIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Mémoire</p>
                <p className="font-semibold text-gray-900">
                  {formatBytes(systemStatus.memory.used)} / {formatBytes(systemStatus.memory.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((systemStatus.memory.used / systemStatus.memory.total) * 100)}% utilisé
                </p>
              </div>
            </div>
          </div>

          {/* Base de données */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CircleStackIcon className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Base de Données</h3>
                  <p className="text-sm text-gray-600">Statut et métriques de la base</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.database.status)}`}>
                {systemStatus.database.status === 'connected' ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Taille de la base</p>
                <p className="font-semibold text-gray-900">{formatBytes(systemStatus.database.size)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Connexions actives</p>
                <p className="font-semibold text-gray-900">{systemStatus.database.connections}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CpuChipIcon className="w-8 h-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  <p className="text-sm text-gray-600">État des services système</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {systemStatus.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">v{service.version}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status === 'running' ? 'Actif' :
                     service.status === 'stopped' ? 'Arrêté' : 'Erreur'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring en temps réel avec graphiques */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Monitoring Temps Réel</h3>
                  <p className="text-sm text-gray-600">Graphiques de performance live</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isMonitoring ? '● Actif' : '● Inactif'}
                </span>
                
                <button
                  onClick={toggleCharts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showCharts ? 'Masquer Graphiques' : 'Afficher Graphiques'}
                </button>
                
                <button
                  onClick={refreshNow}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Actualiser maintenant"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
    
            {showCharts && historicalData.metrics.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CpuMonitor
                  data={historicalData.metrics}
                  onRefresh={refreshNow}
                  refreshInterval={5000}
                />
                
                <MemoryMonitor
                  data={historicalData.metrics}
                  onRefresh={refreshNow}
                  refreshInterval={5000}
                />
              </div>
            )}
    
            {showCharts && historicalData.metrics.length === 0 && (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune donnée de monitoring disponible</p>
                <p className="text-sm text-gray-400 mt-1">
                  Les données apparaîtront après le premier rafraîchissement
                </p>
              </div>
            )}
          </div>
    
          {/* Actions */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Système</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <ArrowPathIcon className="w-4 h-4 mr-2 inline" />
                Redémarrer les services
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Vider le cache
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Tests de diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};