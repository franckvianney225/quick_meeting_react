'use client';
import { useState, useEffect } from 'react';
import { CircleStackIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { SystemMetrics, ChartOptions } from '@/types/system-monitoring';
import { SimpleLineChart } from './SimpleLineChart';

interface MemoryMonitorProps {
  data: SystemMetrics[];
  refreshInterval?: number;
  onRefresh?: () => void;
  showDetails?: boolean;
}

export const MemoryMonitor = ({ 
  data, 
  refreshInterval = 5000, 
  onRefresh,
  showDetails = true 
}: MemoryMonitorProps) => {
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [currentUsed, setCurrentUsed] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      setCurrentUsage(latest.memory.usage);
      setCurrentUsed(latest.memory.used);
    }
  }, [data]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMemoryStatusColor = (usage: number) => {
    if (usage < 60) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryStatus = (usage: number) => {
    if (usage < 40) return 'Faible';
    if (usage < 70) return 'Normal';
    if (usage < 85) return 'Élevé';
    return 'Critique';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CircleStackIcon className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mémoire</h3>
              <p className="text-sm text-gray-600">Chargement en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const latestData = data[data.length - 1];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CircleStackIcon className="w-8 h-8 text-green-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mémoire</h3>
            <p className="text-sm text-gray-600">Utilisation de la mémoire</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className={`text-2xl font-bold ${getMemoryStatusColor(currentUsage)}`}>
              {Math.round(currentUsage)}%
            </p>
            <p className="text-sm text-gray-500">{getMemoryStatus(currentUsage)}</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Graphique d'utilisation mémoire */}
      <div className="mb-6">
        <SimpleLineChart
          data={data}
          metric="memory"
          subMetric="usage"
          title="Utilisation Mémoire (%)"
          height={200}
          width={600}
          options={{
            showGrid: true,
            showLegend: false,
            animate: true,
            colors: ['#10b981']
          }}
        />
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-semibold text-gray-900">{formatBytes(latestData.memory.total)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Utilisé</p>
            <p className="font-semibold text-gray-900">{formatBytes(latestData.memory.used)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Libre</p>
            <p className="font-semibold text-gray-900">{formatBytes(latestData.memory.free)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Utilisation</p>
            <p className="font-semibold text-gray-900">{Math.round(latestData.memory.usage)}%</p>
          </div>
        </div>
      )}

      {/* Barre de progression détaillée */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Utilisation mémoire</span>
          <span>{formatBytes(currentUsed)} / {formatBytes(latestData.memory.total)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              currentUsage < 60 ? 'bg-green-500' :
              currentUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${currentUsage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Détails supplémentaires */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Mémoire utilisée: </span>
            <span className="font-medium">{formatBytes(latestData.memory.used)}</span>
          </div>
          <div>
            <span className="text-gray-600">Mémoire libre: </span>
            <span className="font-medium">{formatBytes(latestData.memory.free)}</span>
          </div>
          <div>
            <span className="text-gray-600">Pourcentage: </span>
            <span className="font-medium">{Math.round(latestData.memory.usage)}%</span>
          </div>
          <div>
            <span className="text-gray-600">Dernière mise à jour: </span>
            <span className="font-medium">
              {new Date(latestData.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};