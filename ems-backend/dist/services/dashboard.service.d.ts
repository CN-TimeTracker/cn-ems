import { IAdminDashboardData, IEmployeeDashboardData, UserRole } from '../interfaces';
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
    /**
     * CELEBRATIONS
     * Returns users having birthday or work anniversary today.
     */
    getCelebrations(): Promise<{
        _id: string;
        name: string;
        profilePicture: string | undefined;
        employeeCode: string | undefined;
        role: UserRole;
        type: "Birthday" | "Anniversary";
    }[]>;
}
//# sourceMappingURL=dashboard.service.d.ts.map