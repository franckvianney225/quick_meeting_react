import { Repository } from 'typeorm';
import { Participant } from './participant.entity';
import { MeetingService } from '../meeting/meeting.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
export declare class ParticipantService {
    private participantRepository;
    private meetingService;
    constructor(participantRepository: Repository<Participant>, meetingService: MeetingService);
    create(uniqueCode: string, participantData: CreateParticipantDto): Promise<Participant>;
    findAllByMeeting(meetingCode: string): Promise<Participant[]>;
    findByEmail(email: string): Promise<Participant[]>;
    isAlreadyRegistered(email: string, meetingCode: string): Promise<boolean>;
}
