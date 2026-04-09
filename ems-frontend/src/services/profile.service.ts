import api from '@/lib/api';
import { ApiResponse, ProfileUpdateRequest, ProfileUpdateChanges } from '../types';

export const requestUpdate = async (changes: ProfileUpdateChanges): Promise<ProfileUpdateRequest> => {
  const res = await api.post<ApiResponse<ProfileUpdateRequest>>('/profile/request-update', changes);
  return res.data.data;
};

export const getMyPendingRequest = async (): Promise<ProfileUpdateRequest | null> => {
  const res = await api.get<ApiResponse<ProfileUpdateRequest | null>>('/profile/my-pending');
  return res.data.data;
};

export const getPendingRequests = async (): Promise<ProfileUpdateRequest[]> => {
  const res = await api.get<ApiResponse<ProfileUpdateRequest[]>>('/profile/requests');
  return res.data.data;
};

export const approveRequest = async (id: string): Promise<ProfileUpdateRequest> => {
  const res = await api.post<ApiResponse<ProfileUpdateRequest>>(`/profile/requests/${id}/approve`);
  return res.data.data;
};

export const rejectRequest = async (id: string): Promise<ProfileUpdateRequest> => {
  const res = await api.post<ApiResponse<ProfileUpdateRequest>>(`/profile/requests/${id}/reject`);
  return res.data.data;
};

export const getReviewHistory = async (): Promise<ProfileUpdateRequest[]> => {
  const res = await api.get<ApiResponse<ProfileUpdateRequest[]>>('/profile/review-history');
  return res.data.data;
};

export const revokeRequest = async (id: string): Promise<ProfileUpdateRequest> => {
  const res = await api.post<ApiResponse<ProfileUpdateRequest>>(`/profile/requests/${id}/revoke`);
  return res.data.data;
};

export const updateProfilePicture = async (file: File): Promise<{ profilePicture: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.patch<ApiResponse<{ profilePicture: string }>>('/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};

export const deleteProfilePicture = async (): Promise<void> => {
  await api.delete('/profile/picture');
};
