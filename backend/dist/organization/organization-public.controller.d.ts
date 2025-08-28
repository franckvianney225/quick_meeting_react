import { OrganizationService } from './organization.service';
export declare class OrganizationPublicController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getOrganizationName(): Promise<{
        name: string;
    }>;
}
