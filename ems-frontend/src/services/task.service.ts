import api from '../lib/api';
import {
  ApiResponse,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../types';

// ─────────────────────────────────────────────
// TASK SERVICE
// ─────────────────────────────────────────────

const TaskService = {
  /**
   * POST /tasks                [Admin]
   * Creates and assigns a task to a user
   */
  createTask: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', input);
    return data.data;
  },

  /**
   * GET /tasks                 [Protected]
   * Admin sees all; Employee sees only own tasks.
   * Supports filter query params: projectId, assignedTo, status
   */
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>('/tasks', {
      params: filters,
    });
    return data.data;
  },

  /**
   * GET /tasks/my              [Protected]
   * Shorthand — returns tasks assigned to the calling user
   */
  getMyTasks: async (): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>('/tasks/my');
    return data.data;
  },

  /**
   * GET /tasks/overdue         [Admin]
   * All tasks past deadline and not Done
   */
  getOverdueTasks: async (): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>('/tasks/overdue');
    return data.data;
  },

  /**
   * GET /tasks/:id             [Protected]
   */
  getTaskById: async (id: string): Promise<Task> => {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data;
  },

  /**
   * PATCH /tasks/:id           [Protected]
   * Admin → all fields | Employee → status only
   */
  updateTask: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(
      `/tasks/${id}`,
      input
    );
    return data.data;
  },

  /**
   * DELETE /tasks/:id          [Admin]
   */
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * PATCH /tasks/:id/start     [Protected]
   */
  startTimer: async (id: string): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/start`);
    return data.data;
  },

  /**
   * PATCH /tasks/:id/pause     [Protected]
   */
  pauseTimer: async (id: string): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/pause`);
    return data.data;
  },

  /**
   * PATCH /tasks/:id/stop      [Protected]
   */
  stopTimer: async (id: string): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/stop`);
    return data.data;
  },
};

export default TaskService;
