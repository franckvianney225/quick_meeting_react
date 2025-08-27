import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Res, 
  UseGuards,
  Query,
  Body 
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { BackupService } from './backup.service';
import { Backup } from './backup.entity';

@Controller('backup')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  async getAllBackups(): Promise<Backup[]> {
    return this.backupService.getAllBackups();
  }

  @Get('stats')
  async getBackupStats() {
    return this.backupService.getBackupStats();
  }

  @Post()
  async createBackup(
    @Body() body: { type?: 'full' | 'incremental'; description?: string }
  ): Promise<Backup> {
    try {
      return await this.backupService.createBackup(
        body.type || 'full',
        body.description
      );
    } catch (error) {
      console.error('Erreur création backup:', error);
      throw new Error(`Erreur lors de la création de la sauvegarde: ${error.message}`);
    }
  }

  @Get(':id/download')
  async downloadBackup(
    @Param('id') id: number,
    @Res() res: Response
  ) {
    const backup = await this.backupService.getBackup(id);
    
    if (!backup) {
      return res.status(404).json({ message: 'Backup non trouvé' });
    }

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${backup.filename}"`,
      'Content-Length': backup.size.toString(),
    });

    const stream = await this.backupService.getBackupFileStream(id);
    stream.pipe(res);
  }

  @Delete(':id')
  async deleteBackup(@Param('id') id: number) {
    await this.backupService.deleteBackup(id);
    return { message: 'Backup supprimé avec succès' };
  }

  @Post(':id/restore')
  async restoreBackup(@Param('id') id: number) {
    // Implémentation de la restauration à venir
    return { message: 'Fonctionnalité de restauration à implémenter' };
  }
}