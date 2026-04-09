import api from '../lib/api';
import {
  ApiResponse,
  WorkLog,
  CreateWorkLogInput,
  WorkLogFilters,
  TodayHours,
  ProjectHoursSummary,
} from '../types';

// ─────────────────────────────────────────────
// WORK LOG SERVICE
// ─────────────────────────────────────────────

const WorkLogService = {
  /**
   * POST /logs                 [Protected]
   * Log hours for the calling user.
   * Backend enforces: assigned tasks only, 10h cap, no log on approved leave
   */
  createLog: async (input: CreateWorkLogInput): Promise<WorkLog> => {
    const { data } = await api.post<ApiResponse<WorkLog>>('/logs', input);
    return data.data;
  },

  /**
   * GET /logs/my               [Protected]
   * Returns calling user's own logs with optional date/project filters
   */
  getMyLogs: async (filters?: WorkLogFilters): Promise<WorkLog[]> => {
    const { data } = await api.get<ApiResponse<WorkLog[]>>('/logs/my', {
      params: filters,
    });
    return data.data;
  },

  /**
   * GET /logs/today            [Protected]
   * Returns { hours, remaining } for today for the calling user
   */
  getTodayHours: async (): Promise<TodayHours> => {
    const { data } = await api.get<ApiResponse<TodayHours>>('/logs/today');
    return data.data;
  },

  /**
   * GET /logs                  [Admin]
   * All logs across all users — supports userId, projectId, date range filters
   */
  getAllLogs: async (filters?: WorkLogFilters): Promise<WorkLog[]> => {
    const { data } = await api.get<ApiResponse<WorkLog[]>>('/logs', {
      params: filters,
    });
    return data.data;
  },

  /**
   * GET /logs/projects/summary [Admin]
   * Total hours per project — used in admin dashboard chart
   */
  getProjectHoursSummary: async (): Promise<ProjectHoursSummary[]> => {
    const { data } = await api.get<ApiResponse<ProjectHoursSummary[]>>(
      '/logs/projects/summary'
    );
    return data.data;
  },

  /**
   * GET /logs/my/project/:projectId/today [Protected]
   * Returns total hours logged by user on project today
   */
  getMyProjectTodayHours: async (projectId: string): Promise<number> => {
    const { data } = await api.get<ApiResponse<number>>(`/logs/my/project/${projectId}/today`);
    return data.data;
  },

  /**
   * GET /logs/admin/breakdown [Admin]
   * Returns Project -> User -> Hours breakdown
   */
  getAdminProjectBreakdown: async (): Promise<any[]> => {
    const { data } = await api.get<ApiResponse<any[]>>('/logs/admin/breakdown');
    return data.data;
  },
};

export default WorkLogService;
