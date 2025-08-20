import { Repository } from 'typeorm';
import { User } from './user.entity';
import { OrganizationService } from '../organization/organization.service';
export declare class UserService {
    private userRepository;
    private organizationService;
    constructor(userRepository: Repository<User>, organizationService: OrganizationService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    update(id: number, userData: Partial<User>): Promise<User>;
    remove(id: number): Promise<void>;
    toggleStatus(id: number): Promise<User>;
    updateLastLogin(id: number): Promise<void>;
}
