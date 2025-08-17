import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Controller('meetings/:meetingCode/participants')
export class ParticipantController {
  constructor(private readonly service: ParticipantService) {}

  @Post()
  async create(
    @Param('meetingCode') meetingCode: string,
    @Body() participantData: CreateParticipantDto
  ) {
    return this.service.create(meetingCode, participantData);
  }

  @Get()
  async findAllByMeeting(@Param('meetingCode') meetingCode: string) {
    return this.service.findAllByMeeting(meetingCode);
  }
}