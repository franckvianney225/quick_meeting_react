import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSetupService } from './user-setup.service';
import { OrganizationModule } from '../organization/organization.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), OrganizationModule, EmailModule],
  controllers: [UserController],
  providers: [UserService, UserSetupService],
  exports: [UserService]
})
export class UserModule {}