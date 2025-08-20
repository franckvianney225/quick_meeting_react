import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { Meeting } from './meeting.entity';
import { Participant } from '../participant/participant.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, Participant]),
    QrCodeModule,
    PdfModule,
    AuthModule
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService]
})
export class MeetingModule {}