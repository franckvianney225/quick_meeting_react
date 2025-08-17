import { Injectable } from '@nestjs/common';
import { Entreprise } from './entreprise.entity';

@Injectable()
export class EntrepriseService {
  private entreprises: Entreprise[] = [];

  findAll(): Entreprise[] {
    return this.entreprises;
  }

  create(entreprise: Entreprise): Entreprise {
    this.entreprises.push(entreprise);
    return entreprise;
  }
}