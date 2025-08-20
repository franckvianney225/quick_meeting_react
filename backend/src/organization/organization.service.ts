import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSettings } from './organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private organizationRepository: Repository<OrganizationSettings>,
  ) {}

  async getCurrentSettings(): Promise<OrganizationSettings | null> {
    const settings = await this.organizationRepository.find();
    return settings.length > 0 ? settings[0] : null;
  }

  async saveSettings(settingsData: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    const existingSettings = await this.getCurrentSettings();
    
    if (existingSettings) {
      // Mise à jour de l'enregistrement existant
      Object.assign(existingSettings, settingsData);
      return this.organizationRepository.save(existingSettings);
    } else {
      // Création d'un nouvel enregistrement
      const organization = this.organizationRepository.create(settingsData);
      return this.organizationRepository.save(organization);
    }
  }

  async deleteSettings(): Promise<void> {
    const existingSettings = await this.getCurrentSettings();
    if (existingSettings) {
      await this.organizationRepository.remove(existingSettings);
    }
  }

  async clearAllSettings(): Promise<void> {
    const allSettings = await this.organizationRepository.find();
    await this.organizationRepository.remove(allSettings);
  }

  async initializeDefaultSettings(): Promise<OrganizationSettings> {
    const existingSettings = await this.getCurrentSettings();
    if (existingSettings) {
      return existingSettings;
    }

    const defaultSettings: Partial<OrganizationSettings> = {
      name: 'Ministère Ivoirien',
      address: 'Abidjan, Côte d\'Ivoire',
      phone: '+225 20 21 22 23',
      email: 'contact@ministere.gov.ci',
      website: 'https://www.ministere.gov.ci',
      logo: null,
      allowedEmailDomains: ['ministere.gov.ci', 'gouv.ci']
    };

    return this.saveSettings(defaultSettings);
  }
}