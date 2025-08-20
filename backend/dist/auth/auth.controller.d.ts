import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { Request } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<{
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
    getProfile(req: Request): Promise<User>;
}
