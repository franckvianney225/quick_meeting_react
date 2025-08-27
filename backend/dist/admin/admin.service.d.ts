import { DataSource } from 'typeorm';
export interface SystemStatus {
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
export declare class AdminService {
    private dataSource;
    constructor(dataSource: DataSource);
    getSystemStatus(): Promise<SystemStatus>;
    private formatUptime;
    private getCpuUsage;
    private getDatabaseStatus;
}
