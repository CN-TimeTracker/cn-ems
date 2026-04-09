import api from '../lib/api';
import {
  ApiResponse,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';

// ─────────────────────────────────────────────
// PROJECT SERVICE
// ─────────────────────────────────────────────

const ProjectService = {
  /**
   * POST /projects             [Admin]
   */
  createProject: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await api.post<ApiResponse<Project>>(
      '/projects',
      input
    );
    return data.data;
  },

  /**
   * GET /projects              [Protected]
   * All projects sorted by deadline
   */
  getAllProjects: async (): Promise<Project[]> => {
    const { data } = await api.get<ApiResponse<Project[]>>('/projects');
    return data.data;
  },

  /**
   * GET /projects/active       [Protected]
   * Only Active projects — used in work-log + task dropdowns
   */
  getActiveProjects: async (): Promise<Project[]> => {
    const { data } = await api.get<ApiResponse<Project[]>>(
      '/projects/active'
    );
    return data.data;
  },

  /**
   * GET /projects/:id          [Protected]
   */
  getProjectById: async (id: string): Promise<Project> => {
    const { data } = await api.get<ApiResponse<Project>>(
      `/projects/${id}`
    );
    return data.data;
  },

  /**
   * PATCH /projects/:id        [Admin]
   */
  updateProject: async (
    id: string,
    input: UpdateProjectInput
  ): Promise<Project> => {
    const { data } = await api.patch<ApiResponse<Project>>(
      `/projects/${id}`,
      input
    );
    return data.data;
  },

  /**
   * GET /projects/assigned     [Protected]
   * Projects assigned to the current employee.
   */
  getAssignedProjects: async (): Promise<Project[]> => {
    const { data } = await api.get<ApiResponse<Project[]>>(
      '/projects/assigned'
    );
    return data.data;
  },

  /**
   * GET /projects/:id/remaining [Protected]
   * Remaining vs spent hours for a project.
   */
  getProjectRemainingHours: async (id: string): Promise<{
    allocated: number;
    spent: number;
    remaining: number;
  }> => {
    const { data } = await api.get<ApiResponse<{
      allocated: number;
      spent: number;
      remaining: number;
    }>>(`/projects/${id}/remaining`);
    return data.data;
  },

  /**
   * DELETE /projects/:id       [Admin]
   */
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export default ProjectService;
