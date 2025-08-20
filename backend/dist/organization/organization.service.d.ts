import { Repository } from 'typeorm';
import { OrganizationSettings } from './organization.entity';
export declare class OrganizationService {
    private organizationRepository;
    constructor(organizationRepository: Repository<OrganizationSettings>);
    getCurrentSettings(): Promise<OrganizationSettings | null>;
    saveSettings(settingsData: Partial<OrganizationSettings>): Promise<OrganizationSettings>;
    deleteSettings(): Promise<void>;
    clearAllSettings(): Promise<void>;
    initializeDefaultSettings(): Promise<OrganizationSettings>;
}
