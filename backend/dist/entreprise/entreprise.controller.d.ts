import { Entreprise } from './entreprise.entity';
import { EntrepriseService } from './entreprise.service';
export declare class EntrepriseController {
    private readonly service;
    constructor(service: EntrepriseService);
    findAll(): Promise<Entreprise[]>;
    create(entrepriseData: Entreprise): Promise<Entreprise>;
}
