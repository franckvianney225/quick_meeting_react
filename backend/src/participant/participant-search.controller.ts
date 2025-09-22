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
    
    // Récupérer tous les participants avec cet email (avec la relation meeting chargée)
    const participants = await this.participantService.findByEmail(email);
    
    // Filtrer pour trouver le participant pour cette réunion spécifique
    const meetingParticipants = participants.filter(p => p.meeting?.uniqueCode === meetingCode);
    
    if (meetingParticipants.length > 0) {
      const existingParticipant = meetingParticipants[0];
      return {
        isRegistered: true,
        participant: {
          email: existingParticipant.email,
          firstName: existingParticipant.firstName,
          lastName: existingParticipant.lastName,
          phone: existingParticipant.phone,
          position: existingParticipant.position,
          company: existingParticipant.company,
          signature: existingParticipant.signature
        }
      };
    }
    
    return { isRegistered: false };
  }
}