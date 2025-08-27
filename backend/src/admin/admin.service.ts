import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as os from 'os';
import * as process from 'process';

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

@Injectable()
export class AdminService {
  constructor(private dataSource: DataSource) {}

  async getSystemStatus(): Promise<SystemStatus> {
    // Statut général
    const status: 'online' | 'offline' | 'degraded' = 'online';

    // Uptime du système
    const uptime = this.formatUptime(process.uptime());

    // Mémoire
    const memory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };

    // CPU
    const cpu = {
      usage: await this.getCpuUsage(),
      cores: os.cpus().length
    };

    // Base de données
    const database = await this.getDatabaseStatus();

    // Services
    const services: { name: string; status: 'running' | 'stopped' | 'error'; version: string }[] = [
      { 
        name: 'API Server', 
        status: 'running' as const, 
        version: process.env.npm_package_version || '2.1.0' 
      },
      {
        name: 'Database',
        status: database.status === 'connected' ? 'running' as const : 'stopped' as const,
        version: 'PostgreSQL'
      },
      { 
        name: 'Cache', 
        status: 'running' as const, 
        version: 'Redis' 
      },
      { 
        name: 'Email Service', 
        status: 'running' as const, 
        version: 'Nodemailer' 
      }
    ];

    return {
      status,
      uptime,
      memory,
      cpu,
      database,
      services
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    return `${days} jours, ${hours} heures, ${minutes} minutes`;
  }

  private async getCpuUsage(): Promise<number> {
    // Méthode simplifiée pour estimer l'utilisation CPU
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    
    const totalUsage = (endUsage.user + endUsage.system) / 1000; // Convertir en ms
    const percentage = (totalUsage / 100) * 100; // Estimation
    
    return Math.min(Math.round(percentage), 100);
  }

  private async getDatabaseStatus(): Promise<{ status: 'connected' | 'disconnected'; size: number; connections: number }> {
    try {
      const isConnected = this.dataSource.isInitialized;
      
      // Récupérer la taille de la base de données (approximative)
      let databaseSize = 0;
      let connections = 0;

      if (isConnected) {
        // Compter le nombre de connexions actives
        const result = await this.dataSource.query(`
          SELECT count(*) as connections 
          FROM pg_stat_activity 
          WHERE datname = current_database()
        `);
        connections = parseInt(result[0]?.connections || '0');

        // Taille de la base
        const sizeResult = await this.dataSource.query(`
          SELECT pg_database_size(current_database()) as size
        `);
        databaseSize = parseInt(sizeResult[0]?.size || '0');
      }

      return {
        status: isConnected ? 'connected' : 'disconnected',
        size: databaseSize,
        connections
      };
    } catch (error) {
      return {
        status: 'disconnected',
        size: 0,
        connections: 0
      };
    }
  }
}