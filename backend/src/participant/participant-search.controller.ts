import { Controller, Get, Query } from '@nestjs/common';
import { ParticipantService } from './participant.service';

@Controller('participants')
export class ParticipantSearchController {
  constructor(private readonly participantService: ParticipantService) {}

  @Get('search')
  async findByEmail(@Query('email') email: string) {
    if (!email) {
      throw new Error('Email parameter is required');
    }
    return this.participantService.findByEmail(email);
  }

  @Get('check-registration')
  async checkRegistration(
    @Query('email') email: string,
    @Query('meetingCode') meetingCode: string
  ) {
    if (!email || !meetingCode) {
      throw new Error('Email and meetingCode parameters are required');
    }
    
    const isRegistered = await this.participantService.isAlreadyRegistered(email, meetingCode);
    return { isRegistered };
  }
}