/**
 * Interfaces pour le monitoring système en temps réel avec historique
 */

export interface SystemMetrics {
  timestamp: number; // Timestamp UNIX en millisecondes
  cpu: {
    usage: number; // Pourcentage d'utilisation (0-100)
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number; // en bytes
    used: number;  // en bytes
    free: number;  // en bytes
    usage: number; // Pourcentage (0-100)
  };
  database: {
    connections: number;
    size: number;  // en bytes
    queries: number; // Requêtes par seconde
  };
  network?: {
    in: number;    // Bytes reçus par seconde
    out: number;   // Bytes envoyés par seconde
  };
}

export interface HistoricalData {
  metrics: SystemMetrics[];
  timeRange: {
    start: number; // Timestamp UNIX
    end: number;   // Timestamp UNIX
  };
  aggregation?: {
    interval: 'minute' | 'hour' | 'day';
    method: 'average' | 'max' | 'min';
  };
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area';
  metrics: ('cpu.usage' | 'memory.usage' | 'memory.used' | 'memory.free' | 'database.connections' | 'database.queries')[];
  timeRange: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  refreshInterval: number; // en millisecondes
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export interface PerformanceAlert {
  id: string;
  metric: keyof SystemMetrics;
  threshold: number;
  condition: 'above' | 'below';
  message: string;
  severity: 'warning' | 'critical';
  triggeredAt?: number;
  resolvedAt?: number;
}

export interface SystemMonitoringState {
  currentMetrics: SystemMetrics | null;
  historicalData: HistoricalData;
  alerts: PerformanceAlert[];
  config: ChartConfig;
  isLoading: boolean;
  lastUpdated: number;
}

// Options pour la personnalisation des graphiques
export interface ChartOptions {
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  curveType?: 'linear' | 'smooth';
  colors?: string[];
  height?: number;
  width?: number;
}

// Données d'exemple pour le développement
export const mockHistoricalData: HistoricalData = {
  metrics: Array.from({ length: 60 }, (_, i) => {
    const timestamp = Date.now() - (59 - i) * 60000; // Données sur 60 minutes
    return {
      timestamp,
      cpu: {
        usage: Math.random() * 30 + 20, // 20-50%
        cores: 4,
        loadAverage: [Math.random() * 2, Math.random() * 1.5, Math.random() * 1]
      },
      memory: {
        total: 8589934592, // 8GB
        used: Math.floor(Math.random() * 4294967296 + 2147483648), // 2-6GB
        free: 0, // Calculé
        usage: 0 // Calculé
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
  }).map(metric => ({
    ...metric,
    memory: {
      ...metric.memory,
      free: metric.memory.total - metric.memory.used,
      usage: (metric.memory.used / metric.memory.total) * 100
    }
  })),
  timeRange: {
    start: Date.now() - 59 * 60000,
    end: Date.now()
  }
};