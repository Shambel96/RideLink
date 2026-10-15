import apiClient from './client';
import { Vehicle, VehicleType } from '../types';

export interface CreateVehiclePayload {
  plateNumber: string;
  model: string;
  type: VehicleType;
  year?: number;
}

export interface UpdateVehiclePayload {
  plateNumber?: string;
  model?: string;
  type?: VehicleType;
  year?: number;
}

export const vehiclesApi = {
  create: (payload: CreateVehiclePayload): Promise<Vehicle> => {
    return apiClient.post('/vehicles', payload);
  },

  findMine: (): Promise<Vehicle[]> => {
    return apiClient.get('/vehicles');
  },

  findOne: (id: string): Promise<Vehicle> => {
    return apiClient.get(`/vehicles/${id}`);
  },

  update: (id: string, payload: UpdateVehiclePayload): Promise<Vehicle> => {
    return apiClient.patch(`/vehicles/${id}`, payload);
  },

  remove: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/vehicles/${id}`);
  },
};
