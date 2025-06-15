import { apiClient } from './api';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface Vehicle {
  id: number;
  license_plate: string;
  is_authorized: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  license_plate: string;
  is_authorized?: boolean;
}

export interface VehicleUpdate {
  license_plate?: string;
  is_authorized?: boolean;
}

export interface ParkingRecord {
  id: number;
  vehicle_id: number;
  entry_time: string;
  exit_time?: string;
  duration_minutes?: number;
  fee?: number;
  entry_image_path: string;
  exit_image_path?: string;
  confidence_score: number;
}

class VehicleService {
  async getVehicles(skip = 0, limit = 100, plateText?: string): Promise<{ items: Vehicle[], total: number }> {
    const token = Cookies.get('access_token');
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (plateText) {
      params.append('plate_text', plateText);
    }
    return apiClient.get<{ items: Vehicle[], total: number }>(`/api/v1/vehicles/?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getVehicle(id: number): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/api/v1/vehicles/${id}/`);
  }

  async getVehicleHistory(id: number, skip = 0, limit = 100): Promise<ParkingRecord[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return apiClient.get<ParkingRecord[]>(`/api/v1/vehicles/${id}/history/?${params.toString()}`);
  }

  async createVehicle(data: VehicleCreate): Promise<Vehicle> {
    return apiClient.post<Vehicle>('/api/v1/vehicles', data);
  }

  async updateVehicle(id: number, data: VehicleUpdate): Promise<Vehicle> {
    return apiClient.put<Vehicle>(`/vehicles/${id}`, data);
  }

  async deleteVehicle(id: number): Promise<void> {
    return apiClient.delete(`/vehicles/${id}`);
  }

  async handleVehicleEntry(): Promise<{
    message: string;
    license_plate: string;
    entry_time: string;
  }> {
    return apiClient.post('/vehicles/entry');
  }

  async handleVehicleExit(): Promise<{
    message: string;
    license_plate: string;
    duration_minutes: number;
    fee: number;
  }> {
    return apiClient.post('/vehicles/exit');
  }
}

export const vehicleService = new VehicleService(); 