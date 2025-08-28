import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './organization.controller';
import { OrganizationPublicController } from './organization-public.controller';
import { OrganizationService } from './organization.service';
import { OrganizationSettings } from './organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSettings])],
  controllers: [OrganizationController, OrganizationPublicController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}