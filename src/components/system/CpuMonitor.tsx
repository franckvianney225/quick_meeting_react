'use client';
import { useState, useEffect } from 'react';
import { CpuChipIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { SystemMetrics, HistoricalData, ChartOptions } from '@/types/system-monitoring';
import { SimpleLineChart } from './SimpleLineChart';

interface CpuMonitorProps {
  data: SystemMetrics[];
  refreshInterval?: number;
  onRefresh?: () => void;
  showDetails?: boolean;
}

export const CpuMonitor = ({ 
  data, 
  refreshInterval = 5000, 
  onRefresh,
  showDetails = true 
}: CpuMonitorProps) => {
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      setCurrentUsage(latest.cpu.usage);
    }
  }, [data]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const getCpuStatusColor = (usage: number) => {
    if (usage < 50) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCpuStatus = (usage: number) => {
    if (usage < 30) return 'Faible';
    if (usage < 60) return 'Normal';
    if (usage < 80) return 'Élevé';
    return 'Critique';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CpuChipIcon className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Processeur (CPU)</h3>
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
          <CpuChipIcon className="w-8 h-8 text-purple-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Processeur (CPU)</h3>
            <p className="text-sm text-gray-600">Performance en temps réel</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className={`text-2xl font-bold ${getCpuStatusColor(currentUsage)}`}>
              {Math.round(currentUsage)}%
            </p>
            <p className="text-sm text-gray-500">{getCpuStatus(currentUsage)}</p>
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

      {/* Graphique d'utilisation CPU */}
      <div className="mb-6">
        <SimpleLineChart
          data={data}
          metric="cpu"
          subMetric="usage"
          title="Utilisation CPU (%)"
          height={200}
          width={600}
          options={{
            showGrid: true,
            showLegend: false,
            animate: true,
            colors: ['#8b5cf6']
          }}
        />
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600">Cœurs</p>
            <p className="font-semibold text-gray-900">{latestData.cpu.cores}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Load 1min</p>
            <p className="font-semibold text-gray-900">
              {latestData.cpu.loadAverage[0].toFixed(2)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Load 5min</p>
            <p className="font-semibold text-gray-900">
              {latestData.cpu.loadAverage[1].toFixed(2)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Load 15min</p>
            <p className="font-semibold text-gray-900">
              {latestData.cpu.loadAverage[2].toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Indicateur de performance */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Performance</span>
          <span>{Math.round(currentUsage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              currentUsage < 50 ? 'bg-green-500' :
              currentUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${currentUsage}%` }}
          />
        </div>
      </div>
    </div>
  );
};