import { ParticipantService } from './participant.service';
export declare class ParticipantSearchController {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    findByEmail(email: string): Promise<import("./participant.entity").Participant[]>;
    checkRegistration(email: string, meetingCode: string): Promise<{
        isRegistered: boolean;
        participant: {
            email: string;
            name: string;
            prenom: string;
            phone: string;
            fonction: string;
            organisation: string;
            signature: string;
        };
    } | {
        isRegistered: boolean;
        participant?: undefined;
    }>;
}
