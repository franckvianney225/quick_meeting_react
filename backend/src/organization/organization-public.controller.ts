import { Controller, Get } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Public } from '../auth/public.decorator';

@Controller('organization/public')
export class OrganizationPublicController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('name')
  @Public()
  async getOrganizationName(): Promise<{ name: string }> {
    const settings = await this.organizationService.getCurrentSettings();
    return { name: settings?.name || 'Ministère' };
  }
}