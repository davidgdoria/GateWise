import { apiClient } from './api';

export interface ParkingSpace {
  id: number;
  name: string;
  is_occupied: boolean;
  current_vehicle_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ParkingSpaceUpdate {
  name?: string;
  is_occupied?: boolean;
  current_vehicle_id?: number;
}

export interface ParkingRecord {
  id: number;
  vehicle_id: number;
  space_id: number;
  entry_time: string;
  exit_time?: string;
  duration_minutes?: number;
  fee?: number;
  entry_image_path: string;
  exit_image_path?: string;
  confidence_score: number;
}

export interface ParkingRecordCreate {
  vehicle_id: number;
  space_id: number;
  entry_image_path: string;
  confidence_score: number;
}

class ParkingService {
  async getParkingSpaces(skip = 0, limit = 100, isOccupied?: boolean): Promise<ParkingSpace[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (isOccupied !== undefined) {
      params.append('is_occupied', isOccupied.toString());
    }
    return apiClient.get<ParkingSpace[]>(`/parking/spaces/?${params.toString()}`);
  }

  async getParkingSpace(id: number): Promise<ParkingSpace> {
    return apiClient.get<ParkingSpace>(`/parking/spaces/${id}/`);
  }

  async updateParkingSpace(id: number, data: ParkingSpaceUpdate): Promise<ParkingSpace> {
    return apiClient.put<ParkingSpace>(`/parking/spaces/${id}`, data);
  }

  async getParkingRecords(
    skip = 0,
    limit = 100,
    startDate?: Date,
    endDate?: Date
  ): Promise<ParkingRecord[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (startDate) {
      params.append('start_date', startDate.toISOString());
    }
    if (endDate) {
      params.append('end_date', endDate.toISOString());
    }
    return apiClient.get<ParkingRecord[]>(`/parking/records/?${params.toString()}`);
  }

  async getParkingRecord(id: number): Promise<ParkingRecord> {
    return apiClient.get<ParkingRecord>(`/parking/records/${id}/`);
  }

  async createParkingRecord(data: ParkingRecordCreate): Promise<ParkingRecord> {
    return apiClient.post<ParkingRecord>('/parking/records', data);
  }

  async recordVehicleExit(recordId: number): Promise<ParkingRecord> {
    return apiClient.put<ParkingRecord>(`/parking/records/${recordId}/exit`);
  }
}

export const parkingService = new ParkingService(); 