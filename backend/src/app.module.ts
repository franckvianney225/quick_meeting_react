// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './meeting/meeting.entity';
import { Entreprise } from './entreprise/entreprise.entity';
import { Participant } from './participant/participant.entity';
import { User } from './user/user.entity';
import { OrganizationSettings } from './organization/organization.entity';
import { EmailConfig } from './email/email-config.entity';
import { AdminLog } from './admin/admin-log.entity';
import { MeetingModule } from './meeting/meeting.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { ParticipantModule } from './participant/participant.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Meeting, Entreprise, Participant, User, OrganizationSettings, EmailConfig, AdminLog],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      })
    }),
    MeetingModule,
    UserModule,
    AuthModule,
    OrganizationModule,
    ParticipantModule,
    EmailModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
