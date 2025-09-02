import { Response } from 'express';
import { BackupService } from './backup.service';
import { Backup } from './backup.entity';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    getAllBackups(): Promise<Backup[]>;
    getBackupStats(): Promise<{
        totalBackups: number;
        totalSize: string;
        successRate: number;
        lastBackup: Date;
    }>;
    createBackup(body: {
        type?: 'full' | 'incremental';
        description?: string;
    }): Promise<Backup>;
    downloadBackup(id: number, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteBackup(id: number): Promise<{
        message: string;
    }>;
    restoreBackup(id: number): Promise<{
        message: string;
        error?: undefined;
        stack?: undefined;
    } | {
        message: string;
        error: any;
        stack: any;
    }>;
}
