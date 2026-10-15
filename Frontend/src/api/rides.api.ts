import apiClient from './client';
import { Ride, PaginatedRides } from '../types';

export interface RequestRidePayload {
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

export interface AcceptRidePayload {
  vehicleId: string;
}

export interface UpdateRideStatusPayload {
  status: 'DRIVER_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
}

export const ridesApi = {
  requestRide: (payload: RequestRidePayload): Promise<Ride> => {
    return apiClient.post('/rides', payload);
  },

  getMyRides: (
    role: 'passenger' | 'driver' = 'passenger',
    page = 1,
    limit = 10
  ): Promise<PaginatedRides> => {
    return apiClient.get('/rides/me', {
      params: { role, page, limit },
    });
  },

  getAvailableRides: (page = 1, limit = 10): Promise<PaginatedRides> => {
    return apiClient.get('/rides/available', {
      params: { page, limit },
    });
  },

  getRideById: (id: string): Promise<Ride> => {
    return apiClient.get(`/rides/${id}`);
  },

  cancelRide: (id: string): Promise<Ride> => {
    return apiClient.patch(`/rides/${id}/cancel`);
  },

  acceptRide: (id: string, payload: AcceptRidePayload): Promise<Ride> => {
    return apiClient.patch(`/rides/${id}/accept`, payload);
  },

  updateStatus: (id: string, payload: UpdateRideStatusPayload): Promise<Ride> => {
    return apiClient.patch(`/rides/${id}/status`, payload);
  },
};
