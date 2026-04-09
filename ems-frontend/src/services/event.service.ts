import api from '../lib/api';
import { IEvent } from '../types';

export const eventService = {
  getAllEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (formData: FormData) => {
    const response = await api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateEvent: async (id: string, formData: FormData) => {
    const response = await api.patch(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

export default eventService;
