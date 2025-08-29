import { DashboardService } from './dashboard.service';
import { DashboardStats } from './dashboard.interface';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardStats(): Promise<DashboardStats>;
}
