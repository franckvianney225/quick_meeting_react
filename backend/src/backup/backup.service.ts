import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from './backup.entity';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { DataSource } from 'typeorm';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    private dataSource: DataSource,
  ) {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createBackup(type: 'full' | 'incremental' = 'full', description?: string): Promise<Backup> {
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

      // Utiliser tar pour créer l'archive (plus simple que archiver)
      await this.createTarArchive(filepath);

      // Attendre que l'archive soit complètement écrite
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stats = await fs.stat(filepath);
      backup.size = stats.size;
      backup.filename = filename;
      backup.path = filepath;
      backup.status = 'success';
      backup.completedAt = new Date();
      
      await this.backupRepository.save(backup);
      return backup;

    } catch (error) {
      this.logger.error('Erreur création backup:', error);
      backup.status = 'failed';
      backup.errorMessage = error.message;
      await this.backupRepository.save(backup);
      throw error;
    }
  }

  private async createTarArchive(filepath: string): Promise<void> {
    // Pour l'instant, créer une archive simple avec les fichiers essentiels
    // En production, vous utiliseriez une commande système comme tar
    const essentialFiles = [
      '.env',
      'package.json',
      'docker-compose.yml'
    ];

    const output = fsSync.createWriteStream(filepath);
    
    // Écrire un header d'archive simple
    const header = Buffer.from('QUICKMEETING_BACKUP_v1.0\n');
    output.write(header);

    // Pour chaque fichier, écrire le nom et le contenu
    for (const file of essentialFiles) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf8');
        const fileHeader = Buffer.from(`FILE:${file}\nSIZE:${content.length}\n`);
        output.write(fileHeader);
        output.write(content);
        output.write('\n');
      } catch (error) {
        this.logger.warn(`Fichier ${file} non trouvé pour la sauvegarde`);
      }
    }

    output.end();

    // Attendre que l'écriture soit terminée
    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  }

  // Méthodes de sauvegarde simplifiées - à implémenter avec des commandes système réelles
  private async backupDatabase(): Promise<string> {
    // En production, utiliser pg_dump ou mysqldump
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
    } finally {
      await queryRunner.release();
    }
  }

  async getAllBackups(): Promise<Backup[]> {
    return this.backupRepository.find({ 
      order: { createdAt: 'DESC' } 
    });
  }

  async getBackup(id: number): Promise<Backup> {
    return this.backupRepository.findOne({ where: { id } });
  }

  async deleteBackup(id: number): Promise<void> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    
    if (backup && backup.path) {
      try {
        await fs.unlink(backup.path);
      } catch (error) {
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

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getBackupFileStream(id: number) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    
    if (!backup || !backup.path) {
      throw new Error('Backup non trouvé');
    }

    return fsSync.createReadStream(backup.path);
  }
}