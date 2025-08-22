import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
export declare class AuthController {
    private authService;
    private userService;
    private emailService;
    constructor(authService: AuthService, userService: UserService, emailService: EmailService);
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
    forgotPassword(forgotPasswordDto: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(req: Request, changePasswordDto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
}
