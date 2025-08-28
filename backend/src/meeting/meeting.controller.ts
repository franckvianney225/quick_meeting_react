import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { PdfService } from '../pdf/pdf.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

interface ParticipantResponse {
  id: number;
  name: string;
  prenom: string;
  email: string;
  phone: string;
  fonction: string;
  organisation: string;
  signature: string;
  meetingId: number;
  registeredAt: string;
  submittedAt?: string;
  signatureDate?: string;
  location?: string;
}
import { Participant } from '../participant/participant.entity';

@Controller('meetings')
export class MeetingController {
  constructor(
    private readonly service: MeetingService,
    private readonly pdfService: PdfService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: AuthenticatedRequest): Promise<Meeting[]> {
    const userId = req.user?.id;
    // Si l'utilisateur est admin, retourner toutes les réunions
    if (req.user?.role === 'admin') {
      return this.service.findAll(); // Sans filtre userId
    }
    return this.service.findAll(userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin(@Req() req: AuthenticatedRequest): Promise<Meeting[]> {
    console.log('=== ADMIN ACCESS CHECK ===');
    console.log('User role:', req.user?.role);
    console.log('User:', req.user);

    // Seuls les administrateurs peuvent accéder à toutes les réunions
    if (!req.user?.role || !['admin', 'administrator', 'Admin'].includes(req.user.role)) {
      console.log('Access denied for role:', req.user?.role);
      throw new HttpException('Accès réservé aux administrateurs', HttpStatus.FORBIDDEN);
    }

    console.log('Access granted for admin');
    return this.service.findAll(); // Retourne toutes les réunions sans filtre
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number, @Req() req: AuthenticatedRequest): Promise<Meeting> {
    const meeting = await this.service.findOne(id);
    // L'admin peut accéder à toutes les réunions
    if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
      throw new HttpException('Accès non autorisé', HttpStatus.FORBIDDEN);
    }
    return meeting;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() meetingData: {
      title: string;
      description?: string;
      status: 'active' | 'completed' | 'inactive';
      location: string;
      max_participants?: number;
      start_date?: string;
      startDate?: string;
      qrConfig?: {
        backgroundColor?: string;
        foregroundColor?: string;
        size?: number;
        includeMargin?: boolean;
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
        includeText?: boolean;
        customText?: string;
        logoUrl?: string;
      };
    },
    @Req() req: AuthenticatedRequest
  ): Promise<Meeting> {
    // Normaliser les noms de champs
    const normalizedData = {
      ...meetingData,
      startDate: meetingData.start_date || meetingData.startDate
    };
    const userId = req.user?.id;
    return this.service.create(normalizedData, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() meetingData: Partial<Meeting>,
    @Req() req: AuthenticatedRequest
  ): Promise<Meeting> {
    try {
      const meeting = await this.service.findOne(id);
      // L'admin peut modifier toutes les réunions
      if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
        throw new HttpException('Accès non autorisé', HttpStatus.FORBIDDEN);
      }
      console.log(`Updating meeting ${id} with data:`, meetingData);
      return await this.service.update(id, meetingData);
    } catch (err) {
      console.error('Erreur dans le contrôleur:', err);
      throw new HttpException(
        err.message || 'Erreur lors de la mise à jour',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number, @Req() req: AuthenticatedRequest): Promise<void> {
    const meeting = await this.service.findOne(id);
    // L'admin peut supprimer toutes les réunions
    if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
      throw new HttpException('Accès non autorisé', HttpStatus.FORBIDDEN);
    }
    return this.service.remove(id);
  }

  @Post(':code/participants')
  async handleParticipantRegistration(
    @Param('code') code: string,
    @Body() participantData: {
      email: string;
      firstName: string;
      lastName: string;
      company?: string;
      position?: string;
      phone: string;
      signature: string;
      agreedToTerms: boolean;
      location?: string;
    }
  ): Promise<{success: boolean}> {
    try {
      const result = await this.service.registerParticipant(code, participantData);
      return {success: result};
    } catch (err) {
      throw new HttpException(
        err.message || "Erreur lors de l'enregistrement",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard)
  async getMeetingParticipants(
    @Param('id') id: number,
    @Req() req: AuthenticatedRequest
  ): Promise<ParticipantResponse[]> {
    try {
      const meeting = await this.service.findOne(id);
      // L'admin peut voir les participants de toutes les réunions
      if (meeting.createdById !== req.user?.id && req.user?.role !== 'admin') {
        throw new HttpException('Accès non autorisé', HttpStatus.FORBIDDEN);
      }
      return await this.service.getMeetingParticipants(id);
    } catch (err) {
      throw new HttpException(
        err.message || "Erreur lors de la récupération des participants",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/qrcode')
  async generateQRCode(
    @Param('id') id: number,
    @Body() data: {
      url: string;
      qrConfig?: {
        color?: {
          dark?: string;
          light?: string;
        };
        size?: number;
      };
    }
  ): Promise<Buffer> {
    try {
      const meeting = await this.service.findOne(id);
      return this.pdfService.generateMeetingQRPDF(
        data.url,
        meeting.title,
        data.qrConfig
      );
    } catch (err) {
      throw new HttpException(
        err.message || 'Erreur lors de la génération du QR code',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('status/:code')
  async getMeetingStatus(@Param('code') code: string): Promise<{ status: string; title: string }> {
    try {
      return await this.service.getMeetingStatusByCode(code);
    } catch (err) {
      throw new HttpException(
        err.message || 'Erreur lors de la vérification du statut',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('validate/:meetingId/:code')
  async validateMeetingAccess(
    @Param('meetingId') meetingId: string,
    @Param('code') code: string
  ): Promise<{ status: string; title: string }> {
    try {
      // Valider que meetingId est un nombre
      const meetingIdNum = parseInt(meetingId, 10);
      if (isNaN(meetingIdNum)) {
        throw new Error('ID de réunion invalide');
      }

      return await this.service.validateMeetingIdAndCode(meetingIdNum, code);
    } catch (err) {
      throw new HttpException(
        err.message || 'Erreur lors de la validation',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}