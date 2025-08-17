import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
export declare class ParticipantController {
    private readonly service;
    constructor(service: ParticipantService);
    create(meetingCode: string, participantData: CreateParticipantDto): Promise<import("./participant.entity").Participant>;
    findAllByMeeting(meetingCode: string): Promise<import("./participant.entity").Participant[]>;
}
