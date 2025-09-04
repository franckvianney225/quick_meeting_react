import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MeetingSchedulerService } from './meeting-scheduler.service';
import { Meeting } from './meeting.entity';
import { Participant } from '../participant/participant.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, Participant]),
    ScheduleModule.forRoot(),
    QrCodeModule,
    PdfModule,
    AuthModule,
    EmailModule
  ],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingSchedulerService],
  exports: [MeetingService]
})
export class MeetingModule {}