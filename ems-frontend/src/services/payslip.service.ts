import api from '../lib/api';
import { Payslip, ApiResponse } from '../types';

const payslipService = {
  /**
   * Admin uploads a payslip
   */
  upload: async (employeeCode: string, month: number, year: number, file: File): Promise<ApiResponse<Payslip>> => {
    const formData = new FormData();
    formData.append('employeeCode', employeeCode);
    formData.append('month', month.toString());
    formData.append('year', year.toString());
    formData.append('file', file);

    const { data } = await api.post<ApiResponse<Payslip>>('/payslips/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Employee fetches their own payslip record for a month/year
   */
  fetch: async (month: number, year: number): Promise<ApiResponse<Payslip | null>> => {
    const { data } = await api.get<ApiResponse<Payslip>>('/payslips/download', {
      params: { month, year },
    });
    return data;
  },

  /**
   * Employee fetches their history
   */
  history: async (): Promise<ApiResponse<Payslip[]>> => {
    const { data } = await api.get<ApiResponse<Payslip[]>>('/payslips/history');
    return data;
  },

  /**
   * Get all salary configurations (Admin)
   */
  getAllConfigs: async (filters: { month?: string | number, year?: string | number, userId?: string } = {}): Promise<ApiResponse<any[]>> => {
    const { data } = await api.get<ApiResponse<any[]>>('/payslips/config/all', {
      params: filters
    });
    return data;
  },

  /**
   * Get all configs for current user (History)
   */
  getMyConfigs: async (): Promise<ApiResponse<any[]>> => {
    const { data } = await api.get<ApiResponse<any[]>>('/payslips/config/me');
    return data;
  },

  /**
   * Generates dynamic payslip data
   */
  generate: async (month: number, year: number, userId?: string, leaveOverride?: number): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/payslips/generate', {
      params: { month, year, userId, leaveOverride },
    });
    return data;
  },

  /**
   * Update salary configuration (LOP override / Approval)
   */
  updateConfig: async (payload: { userId: string; month: number; year: number; lopOverride?: number; isApproved?: boolean }): Promise<ApiResponse<any>> => {
    const { data } = await api.post<ApiResponse<any>>('/payslips/config', payload);
    return data;
  },

  /**
   * Get salary configuration
   */
  getConfig: async (month: number, year: number, userId?: string): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/payslips/config', {
      params: { month, year, userId }
    });
    return data;
  },
};

export default payslipService;
