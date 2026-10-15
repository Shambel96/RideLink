import apiClient from './client';
import { DriverProfile, DriverVerificationStatus, DriverAvailabilityStatus, PaginatedDrivers } from '../types';

export interface RegisterDriverPayload {
  licenseNumber: string;
}

export interface UpdateAvailabilityPayload {
  status: DriverAvailabilityStatus;
  latitude?: number;
  longitude?: number;
}

export interface VerifyDriverPayload {
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
}

export const driversApi = {
  register: (payload: RegisterDriverPayload): Promise<DriverProfile> => {
    return apiClient.post('/drivers/register', payload);
  },

  getMyProfile: (): Promise<DriverProfile> => {
    return apiClient.get('/drivers/me');
  },

  updateAvailability: (payload: UpdateAvailabilityPayload): Promise<DriverProfile> => {
    return apiClient.patch('/drivers/me/availability', payload);
  },

  findAll: (params?: { page?: number; limit?: number; status?: DriverVerificationStatus }): Promise<PaginatedDrivers> => {
    return apiClient.get('/drivers', { params });
  },

  findOne: (id: string): Promise<DriverProfile> => {
    return apiClient.get(`/drivers/${id}`);
  },

  verify: (id: string, payload: VerifyDriverPayload): Promise<DriverProfile> => {
    return apiClient.patch(`/drivers/${id}/verify`, payload);
  },
};
