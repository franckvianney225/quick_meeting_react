import { Controller, Get, Post, Body } from '@nestjs/common';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly service: MeetingService) {}

  @Get()
  async findAll(): Promise<Meeting[]> {
    return this.service.findAll();
  }

  @Post() 
  async create(@Body() meetingData: Meeting): Promise<Meeting> {
    return this.service.create(meetingData);
  }
}