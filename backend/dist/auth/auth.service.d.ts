import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { User } from '../user/user.entity';
export declare class AuthService {
    private userService;
    private jwtService;
    private organizationService;
    constructor(userService: UserService, jwtService: JwtService, organizationService: OrganizationService);
    validateUser(email: string, password: string): Promise<Omit<User, 'password'>>;
    login(user: Omit<User, 'password'>): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            status: string;
            lastLogin: string;
            avatar: string;
            civility: string;
        };
    }>;
    validateToken(payload: {
        sub: number;
        email: string;
        role: string;
    }): Promise<User>;
}
