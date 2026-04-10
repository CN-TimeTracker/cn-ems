import api from '../lib/api';
import { ApiResponse, LoginInput, LoginResult, User } from '../types';

// ─────────────────────────────────────────────
// AUTH SERVICE
// All calls go through the shared axios instance
// which injects the JWT automatically
// ─────────────────────────────────────────────

const AuthService = {
  /**
   * POST /auth/login
   * Returns JWT token + public user object
   */
  login: async (input: LoginInput): Promise<LoginResult> => {
    const { data } = await api.post<ApiResponse<LoginResult>>(
      '/auth/login',
      input
    );
    return data.data;
  },

  /**
   * GET /auth/me
   * Returns the currently authenticated user's profile
   */
  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  /**
   * POST /auth/logout
   * Server acknowledges; client clears local token
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * PATCH /auth/password
   * Change current user's password
   */
  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.patch('/auth/password', passwords);
  },
};

export default AuthService;
