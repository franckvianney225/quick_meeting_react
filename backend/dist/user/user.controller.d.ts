import { User } from './user.entity';
import { UserService } from './user.service';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    update(id: number, userData: Partial<User>): Promise<User>;
    remove(id: number): Promise<{
        message: string;
    }>;
    toggleStatus(id: number): Promise<User>;
    getProfile(id: number): Promise<User>;
    updateProfile(id: number, profileData: Partial<User>): Promise<User>;
    uploadAvatar(id: number, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
    activateAccount(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
        user: User;
    }>;
    resendInvitation(id: number): Promise<{
        message: string;
    }>;
}
