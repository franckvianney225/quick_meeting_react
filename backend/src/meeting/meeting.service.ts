import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import { v4 as uuidv4 } from 'uuid';
import { QrCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    private qrCodeService: QrCodeService
  ) {}

  async create(meetingData: Partial<Meeting>): Promise<Meeting> {
    const meeting = this.meetingRepository.create({
      ...meetingData,
      code: uuidv4().substring(0, 8),
    });
    const savedMeeting = await this.meetingRepository.save(meeting);
    savedMeeting.qrCode = await this.qrCodeService.generateMeetingQRCode(savedMeeting.code);
    return savedMeeting;
  }

  async findAll(): Promise<Meeting[]> {
    return this.meetingRepository.find();
  }

  async findOneByCode(code: string): Promise<Meeting | null> {
    return this.meetingRepository.findOne({ where: { code } });
  }
}