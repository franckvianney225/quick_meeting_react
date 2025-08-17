import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { PdfService } from '../pdf/pdf.service';

@Controller('meetings')
export class MeetingController {
  constructor(
    private readonly service: MeetingService,
    private readonly pdfService: PdfService
  ) {}

  @Get()
  async findAll(): Promise<Meeting[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Meeting> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() meetingData: {
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'inactive';
    location: string;
    max_participants?: number;
    start_date?: string;
    startDate?: string;
  }): Promise<Meeting> {
    // Normaliser les noms de champs
    const normalizedData = {
      ...meetingData,
      startDate: meetingData.start_date || meetingData.startDate
    };
    return this.service.create(normalizedData);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() meetingData: Partial<Meeting>
  ): Promise<Meeting> {
    try {
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
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
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
}