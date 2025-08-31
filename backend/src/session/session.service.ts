import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { User } from '../user/user.entity';

interface DeviceInfo {
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
}

interface SessionWhereCondition {
  user: { id: number };
  isActive: boolean;
  id?: { $ne: number };
}

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async createSession(user: User, token: string, deviceInfo: DeviceInfo): Promise<Session> {
    const session = this.sessionRepository.create({
      user,
      token,
      deviceType: deviceInfo.deviceType || 'Unknown',
      browser: deviceInfo.browser || 'Unknown',
      os: deviceInfo.os || 'Unknown',
      ipAddress: deviceInfo.ipAddress,
      location: deviceInfo.location,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
      lastActivity: new Date(),
    });

    return await this.sessionRepository.save(session);
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { lastActivity: 'DESC' },
    });
  }

  async getActiveUserSessions(userId: number): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: { 
        user: { id: userId },
        isActive: true 
      },
      relations: ['user'],
      order: { lastActivity: 'DESC' },
    });
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivity: new Date(),
    });
  }

  async deactivateSession(sessionId: number): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionRepository.update(sessionId, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  async deactivateAllUserSessions(userId: number, excludeSessionId?: number): Promise<void> {
    const queryBuilder = this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where('user.id = :userId', { userId })
      .andWhere('isActive = :isActive', { isActive: true });

    if (excludeSessionId) {
      queryBuilder.andWhere('id != :excludeSessionId', { excludeSessionId });
    }

    await queryBuilder.execute();
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .orWhere('isActive = false')
      .execute();
  }

  async getSessionDeviceInfo(userAgent: string, ip: string): Promise<DeviceInfo> {
    // Simple device detection from user agent
    const deviceInfo = {
      deviceType: 'Desktop',
      browser: 'Unknown',
      os: 'Unknown',
      ipAddress: ip,
      location: null, // Could be enhanced with IP geolocation
    };

    if (userAgent) {
      // Browser detection
      if (userAgent.includes('Chrome')) deviceInfo.browser = 'Chrome';
      else if (userAgent.includes('Firefox')) deviceInfo.browser = 'Firefox';
      else if (userAgent.includes('Safari')) deviceInfo.browser = 'Safari';
      else if (userAgent.includes('Edge')) deviceInfo.browser = 'Edge';

      // OS detection
      if (userAgent.includes('Windows')) deviceInfo.os = 'Windows';
      else if (userAgent.includes('Mac')) deviceInfo.os = 'macOS';
      else if (userAgent.includes('Linux')) deviceInfo.os = 'Linux';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        deviceInfo.os = 'iOS';
        deviceInfo.deviceType = 'Mobile';
      } else if (userAgent.includes('Android')) {
        deviceInfo.os = 'Android';
        deviceInfo.deviceType = 'Mobile';
      }
    }

    return deviceInfo;
  }
}