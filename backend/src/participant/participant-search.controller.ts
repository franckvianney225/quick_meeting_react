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
    
    if (isRegistered) {
      // Si le participant est déjà inscrit, retourner ses informations complètes
      const meeting = await this.participantService['meetingService'].findOneByCode(meetingCode);
      if (!meeting) {
        throw new Error('Réunion non trouvée');
      }
      
      const existingParticipant = await this.participantService['participantRepository'].findOne({
        where: {
          email,
          meeting: { id: meeting.id }
        },
        relations: ['meeting']
      });
      
      if (existingParticipant) {
        return {
          isRegistered: true,
          participant: {
            email: existingParticipant.email,
            name: existingParticipant.name,
            prenom: existingParticipant.prenom,
            phone: existingParticipant.phone,
            fonction: existingParticipant.fonction,
            organisation: existingParticipant.organisation,
            signature: existingParticipant.signature
          }
        };
      }
    }
    
    return { isRegistered: false };
  }
}