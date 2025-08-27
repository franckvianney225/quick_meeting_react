"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const os = require("os");
const process = require("process");
let AdminService = class AdminService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getSystemStatus() {
        const status = 'online';
        const uptime = this.formatUptime(process.uptime());
        const memory = {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem()
        };
        const cpu = {
            usage: await this.getCpuUsage(),
            cores: os.cpus().length
        };
        const database = await this.getDatabaseStatus();
        const services = [
            {
                name: 'API Server',
                status: 'running',
                version: process.env.npm_package_version || '2.1.0'
            },
            {
                name: 'Database',
                status: database.status === 'connected' ? 'running' : 'stopped',
                version: 'PostgreSQL'
            },
            {
                name: 'Cache',
                status: 'running',
                version: 'Redis'
            },
            {
                name: 'Email Service',
                status: 'running',
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
    formatUptime(seconds) {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        return `${days} jours, ${hours} heures, ${minutes} minutes`;
    }
    async getCpuUsage() {
        const startUsage = process.cpuUsage();
        await new Promise(resolve => setTimeout(resolve, 100));
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = (endUsage.user + endUsage.system) / 1000;
        const percentage = (totalUsage / 100) * 100;
        return Math.min(Math.round(percentage), 100);
    }
    async getDatabaseStatus() {
        try {
            const isConnected = this.dataSource.isInitialized;
            let databaseSize = 0;
            let connections = 0;
            if (isConnected) {
                const result = await this.dataSource.query(`
          SELECT count(*) as connections 
          FROM pg_stat_activity 
          WHERE datname = current_database()
        `);
                connections = parseInt(result[0]?.connections || '0');
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
        }
        catch (error) {
            return {
                status: 'disconnected',
                size: 0,
                connections: 0
            };
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AdminService);
//# sourceMappingURL=admin.service.js.map