import { AdminService, SystemStatus } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getSystemStatus(): Promise<SystemStatus>;
}
