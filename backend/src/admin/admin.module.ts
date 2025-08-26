import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLog } from './admin-log.entity';
import { AdminLogService } from './admin-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminLog])],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminModule {}