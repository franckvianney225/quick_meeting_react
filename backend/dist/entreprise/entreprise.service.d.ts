import { Entreprise } from './entreprise.entity';
export declare class EntrepriseService {
    private entreprises;
    findAll(): Entreprise[];
    create(entreprise: Entreprise): Entreprise;
}
