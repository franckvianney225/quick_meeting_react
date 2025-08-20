import { Controller, Get, Post, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationSettings } from './organization.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organization')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async getSettings(): Promise<OrganizationSettings | null> {
    return this.organizationService.getCurrentSettings();
  }

  @Post()
  async saveSettings(@Body() organizationData: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    return this.organizationService.saveSettings(organizationData);
  }

  @Put()
  async updateSettings(@Body() organizationData: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    return this.organizationService.saveSettings(organizationData);
  }

  @Delete()
  async deleteSettings(): Promise<void> {
    return this.organizationService.deleteSettings();
  }

  @Delete('clear-all')
  async clearAllSettings(): Promise<void> {
    return this.organizationService.clearAllSettings();
  }
}