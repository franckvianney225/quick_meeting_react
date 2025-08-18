import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Controller('meetings/:uniqueCode/participants')
export class ParticipantController {
  constructor(private readonly service: ParticipantService) {}

  @Post()
  async create(
    @Param('uniqueCode') uniqueCode: string,
    @Body() participantData: CreateParticipantDto
  ) {
    return this.service.create(uniqueCode, participantData);
  }

  @Get()
  async findAllByMeeting(@Param('meetingCode') meetingCode: string) {
    return this.service.findAllByMeeting(meetingCode);
  }
}