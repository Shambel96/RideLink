import apiClient from './client';
import { AuthResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiClient.post('/auth/register', payload);
  },

  login: (payload: LoginPayload): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', payload);
  },

  logout: (): Promise<{ message: string }> => {
    const refreshToken = localStorage.getItem('ridelink_refresh_token');
    return apiClient.post(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
  },

  getMe: (): Promise<User> => {
    return apiClient.get('/users/me');
  },
};
