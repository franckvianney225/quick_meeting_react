import { OrganizationService } from './organization.service';
import { OrganizationSettings } from './organization.entity';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getSettings(): Promise<OrganizationSettings | null>;
    saveSettings(organizationData: Partial<OrganizationSettings>): Promise<OrganizationSettings>;
    updateSettings(organizationData: Partial<OrganizationSettings>): Promise<OrganizationSettings>;
    deleteSettings(): Promise<void>;
    clearAllSettings(): Promise<void>;
}
