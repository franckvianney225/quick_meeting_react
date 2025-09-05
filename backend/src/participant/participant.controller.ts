import { Controller, Post, Body, Param, Get, Delete, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('meetings/:uniqueCode/participants')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
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