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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const backup_entity_1 = require("./backup.entity");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const typeorm_3 = require("typeorm");
let BackupService = BackupService_1 = class BackupService {
    constructor(backupRepository, dataSource) {
        this.backupRepository = backupRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.backupDir = path.join(process.cwd(), 'backups');
        this.ensureBackupDirectory();
    }
    async ensureBackupDirectory() {
        try {
            await fs.access(this.backupDir);
        }
        catch {
            await fs.mkdir(this.backupDir, { recursive: true });
        }
    }
    async createBackup(type = 'full', description) {
        const backup = this.backupRepository.create({
            name: `Sauvegarde ${type === 'full' ? 'complète' : 'incrémentielle'}`,
            status: 'pending',
            type: 'manual',
            description,
        });
        await this.backupRepository.save(backup);
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}.tar.gz`;
            const filepath = path.join(this.backupDir, filename);
            await this.createTarArchive(filepath);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const stats = await fs.stat(filepath);
            backup.size = stats.size;
            backup.filename = filename;
            backup.path = filepath;
            backup.status = 'success';
            backup.completedAt = new Date();
            await this.backupRepository.save(backup);
            return backup;
        }
        catch (error) {
            this.logger.error('Erreur création backup:', error);
            backup.status = 'failed';
            backup.errorMessage = error.message;
            await this.backupRepository.save(backup);
            throw error;
        }
    }
    async createTarArchive(filepath) {
        const essentialFiles = [
            '.env',
            'package.json',
            'docker-compose.yml'
        ];
        const output = fsSync.createWriteStream(filepath);
        const header = Buffer.from('QUICKMEETING_BACKUP_v1.0\n');
        output.write(header);
        for (const file of essentialFiles) {
            try {
                const content = await fs.readFile(path.join(process.cwd(), file), 'utf8');
                const fileHeader = Buffer.from(`FILE:${file}\nSIZE:${content.length}\n`);
                output.write(fileHeader);
                output.write(content);
                output.write('\n');
            }
            catch (error) {
                this.logger.warn(`Fichier ${file} non trouvé pour la sauvegarde`);
            }
        }
        output.end();
        return new Promise((resolve, reject) => {
            output.on('finish', resolve);
            output.on('error', reject);
        });
    }
    async backupDatabase() {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);
            let databaseDump = '';
            for (const table of tables) {
                const tableName = table.table_name;
                const data = await queryRunner.query(`SELECT * FROM ${tableName}`);
                databaseDump += `-- Table: ${tableName}\n`;
                databaseDump += JSON.stringify(data, null, 2) + '\n\n';
            }
            return databaseDump;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAllBackups() {
        return this.backupRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
    async getBackup(id) {
        return this.backupRepository.findOne({ where: { id } });
    }
    async deleteBackup(id) {
        const backup = await this.backupRepository.findOne({ where: { id } });
        if (backup && backup.path) {
            try {
                await fs.unlink(backup.path);
            }
            catch (error) {
                this.logger.warn('Impossible de supprimer le fichier de backup:', error);
            }
        }
        await this.backupRepository.delete(id);
    }
    async getBackupStats() {
        const [backups, successCount] = await Promise.all([
            this.backupRepository.find(),
            this.backupRepository.count({ where: { status: 'success' } })
        ]);
        const totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
        const successRate = backups.length > 0 ? Math.round((successCount / backups.length) * 100) : 100;
        const lastBackup = backups.length > 0 ? backups[0].createdAt : null;
        return {
            totalBackups: backups.length,
            totalSize: this.formatBytes(totalSize),
            successRate,
            lastBackup
        };
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    async getBackupFileStream(id) {
        const backup = await this.backupRepository.findOne({ where: { id } });
        if (!backup || !backup.path) {
            throw new Error('Backup non trouvé');
        }
        return fsSync.createReadStream(backup.path);
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(backup_entity_1.Backup)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_3.DataSource])
], BackupService);
//# sourceMappingURL=backup.service.js.map