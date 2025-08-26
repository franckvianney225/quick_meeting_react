import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
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
  async findAllByMeeting(@Param('uniqueCode') uniqueCode: string) {
    return this.service.findAllByMeeting(uniqueCode);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(parseInt(id));
  }

}