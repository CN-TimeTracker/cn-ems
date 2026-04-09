import api from '../lib/api';
import {
  ApiResponse,
  AdminDashboardData,
  EmployeeDashboardData,
} from '../types';

// ─────────────────────────────────────────────
// DASHBOARD SERVICE
// ─────────────────────────────────────────────

const DashboardService = {
  /**
   * GET /dashboard/admin       [Admin]
   * Full accountability snapshot:
   * - who didn't log today
   * - who logged < 4h
   * - overdue tasks
   * - per-project total hours
   * - users with no assigned tasks
   */
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const { data } = await api.get<ApiResponse<AdminDashboardData>>(
      '/dashboard/admin'
    );
    return data.data;
  },

  /**
   * GET /dashboard/employee    [Protected]
   * Personal snapshot:
   * - today's tasks
   * - hours logged today
   * - pending tasks
   * - recent 5 logs
   */
  getEmployeeDashboard: async (): Promise<EmployeeDashboardData> => {
    const { data } = await api.get<ApiResponse<EmployeeDashboardData>>(
      '/dashboard/employee'
    );
    return data.data;
  },

  /**
   * GET /dashboard/celebrations    [Protected]
   * Birthdays and anniversaries
   */
  getCelebrations: async (): Promise<any[]> => {
    const { data } = await api.get<ApiResponse<any[]>>(
      '/dashboard/celebrations'
    );
    return data.data;
  },
};

export default DashboardService;
