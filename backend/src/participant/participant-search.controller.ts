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
}