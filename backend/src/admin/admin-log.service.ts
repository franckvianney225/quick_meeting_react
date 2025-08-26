import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminLog } from './admin-log.entity';

export interface AdminLogData {
  userId: number;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AdminLogService {
  constructor(
    @InjectRepository(AdminLog)
    private adminLogRepository: Repository<AdminLog>,
  ) {}

  async logAction(logData: AdminLogData): Promise<void> {
    const log = this.adminLogRepository.create({
      userId: logData.userId,
      userEmail: logData.userEmail,
      action: logData.action,
      resourceType: logData.resourceType,
      resourceId: logData.resourceId,
      details: logData.details || {},
      ipAddress: logData.ipAddress,
      timestamp: new Date(),
    });

    await this.adminLogRepository.save(log);
  }

  async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: number;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ logs: AdminLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = this.adminLogRepository
      .createQueryBuilder('log')
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters) {
      if (filters.userId) {
        query.andWhere('log.userId = :userId', { userId: filters.userId });
      }
      if (filters.action) {
        query.andWhere('log.action = :action', { action: filters.action });
      }
      if (filters.resourceType) {
        query.andWhere('log.resourceType = :resourceType', { resourceType: filters.resourceType });
      }
      if (filters.startDate) {
        query.andWhere('log.timestamp >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('log.timestamp <= :endDate', { endDate: filters.endDate });
      }
    }

    const [logs, total] = await query.getManyAndCount();
    return { logs, total };
  }

  async getRecentActions(userId?: number, limit: number = 10): Promise<AdminLog[]> {
    const query = this.adminLogRepository
      .createQueryBuilder('log')
      .orderBy('log.timestamp', 'DESC')
      .take(limit);

    if (userId) {
      query.where('log.userId = :userId', { userId });
    }

    return query.getMany();
  }
}