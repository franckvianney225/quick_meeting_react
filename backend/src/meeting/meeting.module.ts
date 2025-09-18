import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MeetingSchedulerService } from './meeting-scheduler.service';
import { Meeting } from './meeting.entity';
import { Participant } from '../participant/participant.entity';
import { User } from '../user/user.entity';
import { ActivityLog } from '../activity/activity-log.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, Participant, User, ActivityLog]),
    ScheduleModule.forRoot(),
    QrCodeModule,
    PdfModule,
    AuthModule,
    EmailModule,
    ActivityModule
  ],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingSchedulerService],
  exports: [MeetingService]
})
export class MeetingModule {}