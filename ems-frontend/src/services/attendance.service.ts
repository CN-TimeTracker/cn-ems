import api from '@/lib/api';
import { ApiResponse, Attendance, CreatePunchInInput, AdminAttendanceEntry } from '@/types';

// ─────────────────────────────────────────────
// EMPLOYEE: punch in for today
// POST /api/v1/attendance/punch-in
// ─────────────────────────────────────────────

export const punchIn = async (input: CreatePunchInInput): Promise<Attendance> => {
  const res = await api.post<ApiResponse<Attendance>>('/attendance/punch-in', input);
  return res.data.data;
};

// ─────────────────────────────────────────────
// EMPLOYEE: punch out for today
// POST /api/v1/attendance/punch-out
// ─────────────────────────────────────────────

export const punchOut = async (): Promise<Attendance> => {
  const res = await api.post<ApiResponse<Attendance>>('/attendance/punch-out');
  return res.data.data;
};

// ─────────────────────────────────────────────
// EMPLOYEE: start a break
// POST /api/v1/attendance/break/start
// ─────────────────────────────────────────────

export const startBreak = async (): Promise<Attendance> => {
  const res = await api.post<ApiResponse<Attendance>>('/attendance/break/start');
  return res.data.data;
};

// ─────────────────────────────────────────────
// EMPLOYEE: end a break
// POST /api/v1/attendance/break/end
// ─────────────────────────────────────────────

export const endBreak = async (): Promise<Attendance> => {
  const res = await api.post<ApiResponse<Attendance>>('/attendance/break/end');
  return res.data.data;
};

// ─────────────────────────────────────────────
// EMPLOYEE: get my attendance record for today
// GET /api/v1/attendance/today
// ─────────────────────────────────────────────

export const getMyToday = async (): Promise<Attendance | null> => {
  const res = await api.get<ApiResponse<Attendance | null>>('/attendance/today');
  return res.data.data;
};

// ─────────────────────────────────────────────
// ADMIN: all employees' attendance for today
// GET /api/v1/attendance/admin/today
// ─────────────────────────────────────────────

export const getAdminTodayView = async (): Promise<AdminAttendanceEntry[]> => {
  const res = await api.get<ApiResponse<AdminAttendanceEntry[]>>('/attendance/admin/today');
  return res.data.data;
};

// ─────────────────────────────────────────────
// ADMIN: all attendance history with filters
// GET /api/v1/attendance/admin/all
// ─────────────────────────────────────────────

export const getAdminAllAttendanceHistory = async (filters: any): Promise<AdminAttendanceEntry[]> => {
  const res = await api.get<ApiResponse<AdminAttendanceEntry[]>>('/attendance/admin/all', { params: filters });
  return res.data.data;
};
// ─────────────────────────────────────────────
// EMPLOYEE: update today's late reason
// PATCH  /api/v1/attendance/today/reason
// ─────────────────────────────────────────────

export const updateTodayLateReason = async (lateReason: string): Promise<Attendance> => {
  const res = await api.patch<ApiResponse<Attendance>>('/attendance/today/reason', { lateReason });
  return res.data.data;
};
