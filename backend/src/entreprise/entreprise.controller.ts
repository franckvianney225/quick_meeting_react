import { Controller, Get, Post, Body } from '@nestjs/common';
import { Entreprise } from './entreprise.entity';
import { EntrepriseService } from './entreprise.service';

@Controller('entreprises')
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