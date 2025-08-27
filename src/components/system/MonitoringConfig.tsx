'use client';
import { useState } from 'react';
import { Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ChartConfig } from '@/types/system-monitoring';

interface MonitoringConfigProps {
  config: ChartConfig;
  onConfigChange: (newConfig: ChartConfig) => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

export const MonitoringConfig = ({
  config,
  onConfigChange,
  isMonitoring,
  onToggleMonitoring
}: MonitoringConfigProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const timeRangeOptions = [
    { value: 5, unit: 'minutes', label: '5 minutes' },
    { value: 15, unit: 'minutes', label: '15 minutes' },
    { value: 30, unit: 'minutes', label: '30 minutes' },
    { value: 1, unit: 'hours', label: '1 heure' },
    { value: 2, unit: 'hours', label: '2 heures' },
    { value: 6, unit: 'hours', label: '6 heures' },
    { value: 12, unit: 'hours', label: '12 heures' },
    { value: 1, unit: 'days', label: '1 jour' }
  ];

  const refreshIntervalOptions = [
    { value: 2000, label: '2 secondes' },
    { value: 5000, label: '5 secondes' },
    { value: 10000, label: '10 secondes' },
    { value: 30000, label: '30 secondes' },
    { value: 60000, label: '1 minute' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Ligne' },
    { value: 'bar', label: 'Barres' },
    { value: 'area', label: 'Aire' }
  ];

  const metricOptions = [
    { value: 'cpu.usage', label: 'CPU - Utilisation (%)' },
    { value: 'memory.usage', label: 'Mémoire - Utilisation (%)' },
    { value: 'memory.used', label: 'Mémoire - Utilisée (MB)' },
    { value: 'memory.free', label: 'Mémoire - Libre (MB)' },
    { value: 'database.connections', label: 'Base - Connexions' },
    { value: 'database.queries', label: 'Base - Requêtes/s' }
  ];

  const handleTimeRangeChange = (value: number, unit: 'minutes' | 'hours' | 'days') => {
    onConfigChange({
      ...config,
      timeRange: { value, unit }
    });
  };

  const handleRefreshIntervalChange = (interval: number) => {
    onConfigChange({
      ...config,
      refreshInterval: interval
    });
  };

  const handleChartTypeChange = (type: 'line' | 'bar' | 'area') => {
    onConfigChange({
      ...config,
      type
    });
  };

  const handleMetricsChange = (metric: string, checked: boolean) => {
    const currentMetrics = [...config.metrics];
    const metricType = metric as ChartConfig['metrics'][number];
    
    if (checked && !currentMetrics.includes(metricType)) {
      onConfigChange({
        ...config,
        metrics: [...currentMetrics, metricType]
      });
    } else if (!checked) {
      onConfigChange({
        ...config,
        metrics: currentMetrics.filter(m => m !== metricType)
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Cog6ToothIcon className="w-5 h-5 mr-2" />
          Configuration du Monitoring
        </h3>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleMonitoring}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isMonitoring
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isMonitoring ? (
              <span className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                Actif
              </span>
            ) : (
              <span className="flex items-center">
                <EyeSlashIcon className="w-4 h-4 mr-1" />
                Pausé
              </span>
            )}
          </button>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            {isConfigOpen ? 'Masquer' : 'Configurer'}
          </button>
        </div>
      </div>

      {isConfigOpen && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Période d'affichage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période d'affichage
            </label>
            <select
              value={`${config.timeRange.value}-${config.timeRange.unit}`}
              onChange={(e) => {
                const [value, unit] = e.target.value.split('-');
                handleTimeRangeChange(parseInt(value), unit as 'minutes' | 'hours' | 'days');
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={`${option.value}-${option.unit}`} value={`${option.value}-${option.unit}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Intervalle de rafraîchissement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalle de rafraîchissement
            </label>
            <select
              value={config.refreshInterval}
              onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {refreshIntervalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type de graphique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de graphique
            </label>
            <select
              value={config.type}
              onChange={(e) => handleChartTypeChange(e.target.value as 'line' | 'bar' | 'area')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {chartTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Métriques à afficher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Métriques à afficher
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {metricOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.metrics.includes(option.value as ChartConfig['metrics'][number])}
                    onChange={(e) => handleMetricsChange(option.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Informations de configuration */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Configuration actuelle</h4>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• Affichage: {config.timeRange.value} {config.timeRange.unit}</p>
              <p>• Rafraîchissement: {refreshIntervalOptions.find(o => o.value === config.refreshInterval)?.label}</p>
              <p>• Type: {chartTypeOptions.find(o => o.value === config.type)?.label}</p>
              <p>• Métriques: {config.metrics.length} sélectionnée(s)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};