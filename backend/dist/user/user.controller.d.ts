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
}
