import apiClient from './client';
import { User } from '../types';

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  getProfile: (): Promise<User> => {
    return apiClient.get('/users/me');
  },

  updateProfile: (data: UpdateUserPayload): Promise<User> => {
    return apiClient.patch('/users/me', data);
  },

  changePassword: (data: ChangePasswordPayload): Promise<{ message: string }> => {
    return apiClient.patch('/users/me/password', data);
  },

  deleteAccount: (): Promise<{ message: string }> => {
    return apiClient.delete('/users/me');
  },
};
