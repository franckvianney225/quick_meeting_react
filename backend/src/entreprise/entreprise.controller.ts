import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Entreprise } from './entreprise.entity';
import { EntrepriseService } from './entreprise.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('entreprises')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class EntrepriseController {
  constructor(private readonly service: EntrepriseService) {}

  @Get()
  async findAll(): Promise<Entreprise[]> {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() entrepriseData: Entreprise): Promise<Entreprise> {
    return this.service.create(entrepriseData);
  }
}