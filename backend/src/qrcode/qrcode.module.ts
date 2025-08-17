import { Module } from '@nestjs/common';
import { QrCodeService } from './qrcode.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [QrCodeService],
  exports: [QrCodeService]
})
export class QrCodeModule {}