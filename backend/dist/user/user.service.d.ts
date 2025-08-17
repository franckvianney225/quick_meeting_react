import { User } from './user.entity';
export declare class UserService {
    private users;
    findAll(): User[];
    create(user: User): User;
}
