import api from '../lib/api';
import { Holiday, HolidayResponse } from '../types/holiday';

export const holidayService = {
  getAll: async (): Promise<Holiday[]> => {
    const response = await api.get<HolidayResponse>('/holidays');
    return response.data.data;
  },

  add: async (data: { date: string; name: string }): Promise<Holiday> => {
    const response = await api.post<{ success: boolean; data: Holiday }>('/holidays', data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },
  update: async (id: string, data: { date?: string; name?: string }): Promise<Holiday> => {
    const response = await api.patch<{ success: boolean; data: Holiday }>(`/holidays/${id}`, data);
    return response.data.data;
  },
};
