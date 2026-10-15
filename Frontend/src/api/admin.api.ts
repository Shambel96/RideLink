import apiClient from './client';
import { AdminDashboardStats, PaginatedUsers, PaginatedRides, RideStatus } from '../types';

export const adminApi = {
  getStats: (): Promise<AdminDashboardStats> => {
    return apiClient.get('/admin/stats');
  },

  getAllUsers: (page = 1, limit = 10, search?: string): Promise<PaginatedUsers> => {
    return apiClient.get('/admin/users', {
      params: { page, limit, search },
    });
  },

  getAllRides: (page = 1, limit = 10, status?: RideStatus): Promise<PaginatedRides> => {
    return apiClient.get('/admin/rides', {
      params: { page, limit, status },
    });
  },
};
