import { Controller, Get, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getUserSessions(@Req() request: any) {
    const userId = request.user.id;
    const sessions = await this.sessionService.getUserSessions(userId);
    
    return sessions.map(session => ({
      id: session.id,
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      isActive: session.isActive,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: this.isCurrentSession(request, session),
    }));
  }

  @Delete(':id')
  async deactivateSession(@Req() request: any, @Param('id') sessionId: string) {
    const userId = request.user.id;
    const session = await this.sessionService.getSessionByToken(request.headers.authorization?.replace('Bearer ', ''));
    
    if (!session || session.user.id !== userId) {
      throw new Error('Unauthorized');
    }

    await this.sessionService.deactivateSession(parseInt(sessionId));
    
    return { message: 'Session déconnectée avec succès' };
  }

  @Delete()
  async deactivateAllSessions(@Req() request: any) {
    const userId = request.user.id;
    const currentSessionToken = request.headers.authorization?.replace('Bearer ', '');
    const currentSession = await this.sessionService.getSessionByToken(currentSessionToken);
    
    if (currentSession) {
      await this.sessionService.deactivateAllUserSessions(userId, currentSession.id);
    } else {
      await this.sessionService.deactivateAllUserSessions(userId);
    }
    
    return { message: 'Toutes les autres sessions ont été déconnectées' };
  }

  private isCurrentSession(request: any, session: any): boolean {
    const currentToken = request.headers.authorization?.replace('Bearer ', '');
    return session.token === currentToken;
  }
}