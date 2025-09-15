import { Controller, Get, Query, UseGuards, Param, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService, ActivityLogFilters } from './activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityType } from './activity-log.entity';
import { ActivityLog } from './activity-log.entity';
import { Request } from 'express';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>
  ) {}

  @Get('meeting/:meetingId')
  async getMeetingActivities(
    @Param('meetingId') meetingId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    const filters: ActivityLogFilters = {
      meetingId: parseInt(meetingId),
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
      type: type as ActivityType,
    };

    return this.activityService.getMeetingActivities(filters);
  }

  @Post('meeting/:meetingId/log')
  @UseGuards(JwtAuthGuard)
  async createActivityLog(
    @Param('meetingId') meetingId: string,
    @Body() body: { type: string; description: string },
    @Req() req: Request
  ) {
    try {
      const meeting = { id: parseInt(meetingId), title: 'Réunion' };
      
      // Créer un log simple sans utilisateur détaillé
      const log = this.activityLogRepository.create({
        type: body.type as ActivityType,
        description: body.description,
        meeting: meeting as any,
        meetingId: parseInt(meetingId)
      });
      
      await this.activityLogRepository.save(log);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la création du log:', error);
      throw new HttpException(
        'Erreur lors de la création du log d\'activité',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}