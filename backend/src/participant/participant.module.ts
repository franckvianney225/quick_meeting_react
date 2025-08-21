import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { ParticipantSearchController } from './participant-search.controller';
import { Participant } from './participant.entity';
import { MeetingModule } from '../meeting/meeting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participant]),
    MeetingModule
  ],
  controllers: [ParticipantController, ParticipantSearchController],
  providers: [ParticipantService],
  exports: [ParticipantService]
})
export class ParticipantModule {}