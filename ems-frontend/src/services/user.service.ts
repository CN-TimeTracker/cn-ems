import api from '../lib/api';
import {
  ApiResponse,
  User,
  CreateUserInput,
  UpdateUserInput,
} from '../types';

// ─────────────────────────────────────────────
// USER SERVICE
// ─────────────────────────────────────────────

const UserService = {
  /**
   * POST /users                [Admin]
   * Creates a new employee account
   */
  createUser: async (input: CreateUserInput): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>('/users', input);
    return data.data;
  },

  /**
   * GET /users                 [Admin]
   * Returns all users sorted by name
   */
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get<ApiResponse<User[]>>('/users');
    return data.data;
  },

  /**
   * GET /users/active          [Protected]
   * Returns active users — used in task-assignment dropdowns
   */
  getActiveEmployees: async (): Promise<User[]> => {
    const { data } = await api.get<ApiResponse<User[]>>('/users/active');
    return data.data;
  },

  /**
   * GET /users/:id             [Admin]
   */
  getUserById: async (id: string): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  /**
   * PATCH /users/:id           [Admin]
   * Update name, role, or active status
   */
  updateUser: async (id: string, input: UpdateUserInput): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>(
      `/users/${id}`,
      input
    );
    return data.data;
  },

  /**
   * DELETE /users/:id          [Admin]
   * Soft-delete — sets isActive: false
   */
  deactivateUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * POST /users/:id/activate    [Admin]
   * Reactivate an inactive account
   */
  activateUser: async (id: string): Promise<void> => {
    await api.post(`/users/${id}/activate`);
  },
};

export default UserService;
