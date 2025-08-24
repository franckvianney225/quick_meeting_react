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
    return this.service.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number, @Req() req: AuthenticatedRequest): Promise<Meeting> {
    const meeting = await this.service.findOne(id);
    if (meeting.createdById !== req.user?.id) {
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
      if (meeting.createdById !== req.user?.id) {
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
    if (meeting.createdById !== req.user?.id) {
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
      if (meeting.createdById !== req.user?.id) {
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
}