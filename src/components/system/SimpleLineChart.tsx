'use client';
import { SystemMetrics, ChartOptions } from '@/types/system-monitoring';

interface SimpleLineChartProps {
  data: SystemMetrics[];
  metric: keyof SystemMetrics;
  subMetric?: string;
  title: string;
  height?: number;
  width?: number;
  options?: ChartOptions;
}

export const SimpleLineChart = ({
  data,
  metric,
  subMetric,
  title,
  height = 200,
  width = 400,
  options = {}
}: SimpleLineChartProps) => {
  const {
    showGrid = true,
    showLegend = true,
    animate = true,
    curveType = 'smooth',
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    height: customHeight,
    width: customWidth
  } = options;

  const chartHeight = customHeight || height;
  const chartWidth = customWidth || width;

  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-white rounded-lg border p-4 flex items-center justify-center"
        style={{ height: chartHeight, width: chartWidth }}
      >
        <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  // Extraire les valeurs selon la métrique
  const values = data.map(item => {
    if (subMetric && metric in item && typeof item[metric] === 'object') {
      const metricObj = item[metric] as Record<string, number>;
      return metricObj[subMetric] || 0;
    }
    return (item[metric] as number) || 0;
  });

  const timestamps = data.map(item => item.timestamp);
  
  // Calculer les min/max pour l'échelle
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Configuration du graphique
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Fonction pour convertir les valeurs en coordonnées
  const getX = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (value: number) => padding.top + innerHeight - ((value - minValue) / valueRange) * innerHeight;

  // Générer les points pour la ligne
  const points = values.map((value, index) => `${getX(index)},${getY(value)}`).join(' ');

  // Générer la grille
  const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (i / 4) * innerHeight;
    const value = maxValue - (i / 4) * valueRange;
    return (
      <g key={i}>
        <line
          x1={padding.left}
          y1={y}
          x2={chartWidth - padding.right}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text
          x={padding.left - 5}
          y={y}
          textAnchor="end"
          dominantBaseline="middle"
          className="text-xs fill-gray-500"
        >
          {Math.round(value)}
        </text>
      </g>
    );
  }) : null;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {showLegend && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">{metric}{subMetric ? `.${subMetric}` : ''}</span>
          </div>
        )}
      </div>

      <svg
        width={chartWidth}
        height={chartHeight}
        className={`${animate ? 'transition-all duration-300' : ''}`}
      >
        {/* Grille d'arrière-plan */}
        {gridLines}

        {/* Ligne du graphique */}
        <polyline
          fill="none"
          stroke={colors[0]}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          className={animate ? 'transition-all duration-300' : ''}
        />

        {/* Points de données avec tooltips améliorés */}
        {values.map((value, index) => (
          <circle
            key={index}
            cx={getX(index)}
            cy={getY(value)}
            r="4"
            fill={colors[0]}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer hover:r-5 transition-all duration-150"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const tooltip = document.getElementById(`tooltip-${index}`);
              if (tooltip) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.top + window.scrollY - 60}px`;
              }
            }}
            onMouseLeave={() => {
              const tooltip = document.getElementById(`tooltip-${index}`);
              if (tooltip) {
                tooltip.style.display = 'none';
              }
            }}
          >
            <title>
              {new Date(timestamps[index]).toLocaleTimeString()}: {Math.round(value * 100) / 100}
            </title>
          </circle>
        ))}

        {/* Tooltips flottants */}
        {values.map((value, index) => (
          <div
            key={index}
            id={`tooltip-${index}`}
            className="fixed hidden bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-50 pointer-events-none"
            style={{ display: 'none' }}
          >
            <div className="font-semibold">
              {new Date(timestamps[index]).toLocaleTimeString()}
            </div>
            <div>{Math.round(value * 100) / 100}</div>
          </div>
        ))}

        {/* Axe X */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#374151"
          strokeWidth="1"
        />

        {/* Axe Y */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="#374151"
          strokeWidth="1"
        />
      </svg>

      {/* Légende inférieure avec informations détaillées */}
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
        {data.length > 0 && (
          <>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              Début: {new Date(timestamps[0]).toLocaleTimeString()}
            </span>
            
            <div className="text-center">
              <div className="font-medium">
                {data.length} points de données
              </div>
              <div>
                {Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / 60000)} min
              </div>
            </div>
            
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              Fin: {new Date(timestamps[timestamps.length - 1]).toLocaleTimeString()}
            </span>
          </>
        )}
      </div>

      {/* Statistiques résumées */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold">Moyenne</div>
            <div>{Math.round(values.reduce((a, b) => a + b, 0) / values.length)}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold">Max</div>
            <div>{Math.round(Math.max(...values))}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold">Min</div>
            <div>{Math.round(Math.min(...values))}</div>
          </div>
        </div>
      )}
    </div>
  );
};