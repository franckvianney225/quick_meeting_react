import { Controller, Delete, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminLogService } from '../admin/admin-log.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('participants')
@UseGuards(JwtAuthGuard)
export class ParticipantAdminController {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly adminLogService: AdminLogService
  ) {}

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    await this.participantService.remove(parseInt(id));
    
    // Logger l'action d'administration
    await this.adminLogService.logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DELETE_PARTICIPANT',
      resourceType: 'participant',
      resourceId: parseInt(id),
      ipAddress: req.ip,
    });

    return { message: 'Participant supprimé avec succès' };
  }
}