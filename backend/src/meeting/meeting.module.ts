import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { Meeting } from './meeting.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting]),
    QrCodeModule,
    PdfModule
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService]
})
export class MeetingModule {}