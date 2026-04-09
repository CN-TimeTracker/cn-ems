import { IAdminDashboardData, IEmployeeDashboardData } from '../interfaces';
export declare class DashboardService {
    /**
     * ADMIN DASHBOARD
     * Runs 6 parallel queries and assembles the accountability snapshot.
     */
    getAdminDashboard(): Promise<IAdminDashboardData>;
    /**
     * EMPLOYEE DASHBOARD
     * Returns today's tasks, hours logged today, pending tasks, and recent 5 logs.
     */
    getEmployeeDashboard(userId: string): Promise<IEmployeeDashboardData>;
}
//# sourceMappingURL=dashboard.service.d.ts.map