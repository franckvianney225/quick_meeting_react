import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from './backup.entity';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { DataSource } from 'typeorm';
import * as archiver from 'archiver';
import * as AdmZip from 'adm-zip';

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
      const filename = `backup-${timestamp}.zip`;
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
    const essentialFiles = [
      '.env',
      'package.json',
      'docker-compose.yml',
      'Dockerfile'
    ];

    const output = fsSync.createWriteStream(filepath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression maximale
    });

    return new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      
      archive.pipe(output);

      // Sauvegarder la base de données en SQL
      this.backupDatabase().then(sqlDump => {
        archive.append(sqlDump, { name: 'database_backup.sql' });

        // Ajouter les fichiers essentiels
        for (const file of essentialFiles) {
          try {
            const filePath = path.join(process.cwd(), file);
            if (fsSync.existsSync(filePath)) {
              archive.file(filePath, { name: file });
            }
          } catch (error) {
            this.logger.warn(`Fichier ${file} non trouvé pour la sauvegarde`);
          }
        }

        // Ajouter le répertoire uploads s'il existe
        const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
        if (fsSync.existsSync(uploadsDir)) {
          archive.directory(uploadsDir, 'uploads');
        }

        archive.finalize();
      }).catch(error => {
        reject(error);
      });
    });
  }

  // Méthodes de sauvegarde simplifiées - à implémenter avec des commandes système réelles
  private async backupDatabase(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      // Récupérer la structure des tables
      const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      let sqlDump = '';
      
      // Générer le dump SQL
      for (const table of tables) {
        const tableName = table.table_name;
        
        // Structure de la table - utiliser une approche plus standard
        const tableStructure = await queryRunner.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = '${tableName}'
          ORDER BY ordinal_position
        `);
        
        sqlDump += `CREATE TABLE ${tableName} (\n`;
        const columns = tableStructure.map(col => {
          let columnDef = `  ${col.column_name} ${col.data_type}`;
          if (col.is_nullable === 'NO') columnDef += ' NOT NULL';
          if (col.column_default) columnDef += ` DEFAULT ${col.column_default}`;
          return columnDef;
        });
        sqlDump += columns.join(',\n') + '\n);\n\n';
        
        // Données de la table
        const data = await queryRunner.query(`SELECT * FROM ${tableName}`);
        if (data.length > 0) {
          sqlDump += `-- Données pour la table ${tableName}\n`;
          for (const row of data) {
            const columns = Object.keys(row).join(', ');
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              return val;
            }).join(', ');
            
            sqlDump += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
          }
          sqlDump += '\n';
        }
      }
      
      return sqlDump;
    } catch (error) {
      this.logger.error('Erreur génération dump SQL:', error);
      
      // Fallback: retourner le format JSON si échec
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

  async restoreBackup(id: number): Promise<void> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    
    if (!backup || !backup.path) {
      throw new Error('Backup non trouvé');
    }

    const zip = new AdmZip(backup.path);
    const entries = zip.getEntries();
    
    // Extraire le dump SQL
    const sqlEntry = entries.find(entry => entry.entryName === 'database_backup.sql');
    if (!sqlEntry) {
      throw new Error('Fichier database_backup.sql non trouvé dans l\'archive');
    }

    const sqlDump = sqlEntry.getData().toString('utf8');
    
    // Exécuter le dump SQL
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      
      this.logger.log('Début de la restauration de la base de données...');
      
      // Exécuter le SQL ligne par ligne
      const sqlStatements = sqlDump.split(';').filter(statement => statement.trim().length > 0);
      
      for (const statement of sqlStatements) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          try {
            // Éviter les lignes de commentaire
            if (!trimmedStatement.startsWith('--')) {
              await queryRunner.query(trimmedStatement + ';');
            }
          } catch (error) {
            this.logger.warn(`Erreur exécution statement SQL: ${error.message}`);
            this.logger.warn(`Statement problématique: ${trimmedStatement}`);
            // Continuer malgré les erreurs
          }
        }
      }
      
      this.logger.log('Restauration de la base de données terminée');
      
    } catch (error) {
      this.logger.error('Erreur majeure lors de la restauration:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Restaurer les fichiers de configuration
    for (const entry of entries) {
      if (entry.entryName !== 'database_backup.sql' && !entry.entryName.startsWith('uploads/')) {
        const filePath = path.join(process.cwd(), entry.entryName);
        const dirPath = path.dirname(filePath);
        
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, entry.getData());
      }
    }

    // Restaurer les uploads
    const uploadEntries = entries.filter(entry => entry.entryName.startsWith('uploads/'));
    for (const entry of uploadEntries) {
      const filePath = path.join(process.cwd(), entry.entryName);
      const dirPath = path.dirname(filePath);
      
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, entry.getData());
    }

    this.logger.log(`Restauration terminée pour le backup ${id}`);
  }
}