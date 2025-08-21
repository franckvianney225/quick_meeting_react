import { Repository } from 'typeorm';
import { User } from './user.entity';
import { OrganizationService } from '../organization/organization.service';
import { EmailService } from '../email/email.service';
export declare class UserService {
    private userRepository;
    private organizationService;
    private emailService;
    constructor(userRepository: Repository<User>, organizationService: OrganizationService, emailService: EmailService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    update(id: number, userData: Partial<User>): Promise<User>;
    remove(id: number): Promise<void>;
    toggleStatus(id: number): Promise<User>;
    updateLastLogin(id: number): Promise<void>;
    activateAccount(token: string, password: string): Promise<User>;
    resendInvitation(userId: number): Promise<void>;
}
