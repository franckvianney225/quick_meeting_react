import { User } from './user.entity';
import { UserService } from './user.service';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    findAll(): Promise<User[]>;
    create(userData: User): Promise<User>;
}
