import { OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from './user.service';
export declare class UserSetupService implements OnApplicationBootstrap {
    private readonly userService;
    constructor(userService: UserService);
    onApplicationBootstrap(): Promise<void>;
    private createDefaultAdmin;
}
