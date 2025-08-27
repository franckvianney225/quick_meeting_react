import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLog } from './admin-log.entity';
import { AdminLogService } from './admin-log.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminLog])],
  controllers: [AdminController],
  providers: [AdminLogService, AdminService],
  exports: [AdminLogService, AdminService],
})
export class AdminModule {}