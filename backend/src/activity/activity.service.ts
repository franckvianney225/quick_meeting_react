import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from './activity-log.entity';
import { User } from '../user/user.entity';
import { Meeting } from '../meeting/meeting.entity';

export interface ActivityLogFilters {
  meetingId?: number;
  userId?: number;
  type?: ActivityType;
  page?: number;
  limit?: number;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async logActivity(
    type: ActivityType,
    description: string,
    meeting: Meeting,
    user?: User,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      type,
      description,
      meeting,
      user,
      metadata,
    });

    return this.activityLogRepository.save(log);
  }

  async getMeetingActivities(
    filters: ActivityLogFilters,
  ): Promise<{ logs: ActivityLog[]; total: number }> {
    const { meetingId, userId, type, page = 1, limit = 20 } = filters;
    
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('log.meeting', 'meeting')
      .where('log.meetingId = :meetingId', { meetingId });

    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }

    if (type) {
      query.andWhere('log.type = :type', { type });
    }

    const [logs, total] = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { logs, total };
  }

  async createMeetingCreatedLog(meeting: Meeting, user: User): Promise<ActivityLog> {
    return this.logActivity(
      ActivityType.MEETING_CREATED,
      `${user.name} a créé une nouvelle réunion "${meeting.title}"`,
      meeting,
      user,
      {
        meetingTitle: meeting.title,
        startDate: meeting.start_date || meeting.startDate,
        location: meeting.location,
      }
    );
  }

  async createMeetingUpdatedLog(meeting: Meeting, user: User, changes: Record<string, any>): Promise<ActivityLog> {
    const changeDescriptions = Object.entries(changes)
      .map(([field, value]) => {
        if (field === 'title') return `le titre en "${value}"`;
        if (field === 'location') return `la localisation en "${value}"`;
        if (field === 'description') return `la description`;
        if (field === 'max_participants') return `le nombre maximum de participants en ${value}`;
        if (field === 'qrConfig') return `la configuration du QR code`;
        return field;
      })
      .join(', ');

    return this.logActivity(
      ActivityType.MEETING_UPDATED,
      `${user.name} a modifié ${changeDescriptions} pour la réunion "${meeting.title}"`,
      meeting,
      user,
      { changes }
    );
  }

  async createMeetingClosedLog(meeting: Meeting, user: User, automatic: boolean = false): Promise<ActivityLog> {
    const type = automatic ? ActivityType.MEETING_AUTO_CLOSED : ActivityType.MEETING_CLOSED;
    const description = automatic
      ? `La réunion "${meeting.title}" a été clôturée automatiquement après 24h`
      : `${user.name} a clôturé la réunion "${meeting.title}"`;

    return this.logActivity(
      type,
      description,
      meeting,
      automatic ? undefined : user,
      { automatic }
    );
  }

  async createMeetingReopenedLog(meeting: Meeting, user: User): Promise<ActivityLog> {
    return this.logActivity(
      ActivityType.MEETING_REOPENED,
      `${user.name} a rouvert la réunion "${meeting.title}"`,
      meeting,
      user
    );
  }

  async createAttendanceListPrintedLog(meeting: Meeting, user: User): Promise<ActivityLog> {
    return this.logActivity(
      ActivityType.ATTENDANCE_LIST_PRINTED,
      `${user.name} a imprimé la liste de présence pour la réunion "${meeting.title}"`,
      meeting,
      user
    );
  }

  async createQrCodePrintedLog(meeting: Meeting, user: User): Promise<ActivityLog> {
    return this.logActivity(
      ActivityType.QR_CODE_PRINTED,
      `${user.name} a imprimé le code QR pour la réunion "${meeting.title}"`,
      meeting,
      user
    );
  }

  async createQrConfigUpdatedLog(meeting: Meeting, user: User, config: any): Promise<ActivityLog> {
    return this.logActivity(
      ActivityType.QR_CONFIG_UPDATED,
      `${user.name} a modifié les couleurs du code QR pour la réunion "${meeting.title}"`,
      meeting,
      user,
      { qrConfig: config }
    );
  }
}