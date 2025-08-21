import { ParticipantService } from './participant.service';
export declare class ParticipantSearchController {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    findByEmail(email: string): Promise<import("./participant.entity").Participant[]>;
}
