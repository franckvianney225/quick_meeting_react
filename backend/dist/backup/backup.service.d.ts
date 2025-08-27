import { Repository } from 'typeorm';
import { Backup } from './backup.entity';
import * as fsSync from 'fs';
import { DataSource } from 'typeorm';
export declare class BackupService {
    private backupRepository;
    private dataSource;
    private readonly logger;
    private readonly backupDir;
    constructor(backupRepository: Repository<Backup>, dataSource: DataSource);
    private ensureBackupDirectory;
    createBackup(type?: 'full' | 'incremental', description?: string): Promise<Backup>;
    private createTarArchive;
    private backupDatabase;
    getAllBackups(): Promise<Backup[]>;
    getBackup(id: number): Promise<Backup>;
    deleteBackup(id: number): Promise<void>;
    getBackupStats(): Promise<{
        totalBackups: number;
        totalSize: string;
        successRate: number;
        lastBackup: Date;
    }>;
    private formatBytes;
    getBackupFileStream(id: number): Promise<fsSync.ReadStream>;
}
