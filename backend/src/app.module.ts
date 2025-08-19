// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './meeting/meeting.entity';
import { Entreprise } from './entreprise/entreprise.entity';
import { Participant } from './participant/participant.entity';
import { User } from './user/user.entity';
import { MeetingModule } from './meeting/meeting.module';
import { UserModule } from './user/user.module';

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
        entities: [Meeting, Entreprise, Participant, User],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      })
    }),
    MeetingModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
