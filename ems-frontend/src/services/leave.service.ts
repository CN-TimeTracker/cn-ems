import api from '../lib/api';
import {
  ApiResponse,
  Leave,
  CreateLeaveInput,
  ReviewLeaveInput,
  WorkLogFilters,
} from '../types';

// ─────────────────────────────────────────────
// LEAVE SERVICE
// ─────────────────────────────────────────────

const LeaveService = {
  /**
   * POST /leaves               [Protected]
   * Employee applies for leave
   */
  applyLeave: async (input: CreateLeaveInput): Promise<Leave> => {
    const { data } = await api.post<ApiResponse<Leave>>('/leaves', input);
    return data.data;
  },

  /**
   * GET /leaves                [Protected]
   * Admin → all leaves (optionally filtered by ?userId=)
   * Employee → only own leaves
   */
  getLeaves: async (filters?: { userId?: string }): Promise<Leave[]> => {
    const { data } = await api.get<ApiResponse<Leave[]>>('/leaves', {
      params: filters,
    });
    return data.data;
  },

  /**
   * GET /leaves/pending        [Admin]
   * Approval queue — all pending leave requests
   */
  getPendingLeaves: async (): Promise<Leave[]> => {
    const { data } = await api.get<ApiResponse<Leave[]>>(
      '/leaves/pending'
    );
    return data.data;
  },

  /**
   * PATCH /leaves/:id/review   [Admin]
   * Approve or reject a leave request
   */
  reviewLeave: async (
    id: string,
    input: ReviewLeaveInput
  ): Promise<Leave> => {
    const { data } = await api.patch<ApiResponse<Leave>>(
      `/leaves/${id}/review`,
      input
    );
    return data.data;
  },

  /**
   * DELETE /leaves/:id         [Protected]
   * Employee cancels their own pending leave
   */
  cancelLeave: async (id: string): Promise<void> => {
    await api.delete(`/leaves/${id}`);
  },
};

export default LeaveService;
