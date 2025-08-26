import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { ParticipantSearchController } from './participant-search.controller';
import { ParticipantAdminController } from './participant-admin.controller';
import { Participant } from './participant.entity';
import { MeetingModule } from '../meeting/meeting.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participant]),
    MeetingModule,
    AdminModule
  ],
  controllers: [ParticipantController, ParticipantSearchController, ParticipantAdminController],
  providers: [ParticipantService],
  exports: [ParticipantService]
})
export class ParticipantModule {}