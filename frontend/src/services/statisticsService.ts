import { apiClient } from './api';

export interface ParkingOverview {
  total_spaces: number;
  occupied_spaces: number;
  available_spaces: number;
  total_vehicles: number;
  occupancy_rate: number;
  total_revenue: number;
  average_duration: number;
  total_entries: number;
  peak_hours: string[];
}

export interface PopularSpace {
  id: number;
  name: string;
  usage_count: number;
  average_duration: number;
}

export interface RevenueStatistics {
  total_revenue: number;
  average_fee: number;
  revenue_by_day: Record<string, number>;
  revenue_by_hour: Record<string, number>;
}

class StatisticsService {
  async getParkingOverview(): Promise<ParkingOverview> {
    return apiClient.get<ParkingOverview>('/statistics/overview');
  }

  async getHourlyStatistics(date: Date): Promise<Record<string, number>> {
    const params = new URLSearchParams();
    params.append('date', date.toISOString());
    return apiClient.get<Record<string, number>>(`/statistics/hourly?${params.toString()}`);
  }

  async getDailyStatistics(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const params = new URLSearchParams();
    params.append('start_date', startDate.toISOString());
    params.append('end_date', endDate.toISOString());
    return apiClient.get<Record<string, number>>(`/statistics/daily?${params.toString()}`);
  }

  async getPopularSpaces(limit = 10): Promise<PopularSpace[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    return apiClient.get<PopularSpace[]>(`/statistics/popular-spaces?${params.toString()}`);
  }

  async getRevenueStatistics(startDate: Date, endDate: Date): Promise<RevenueStatistics> {
    const params = new URLSearchParams();
    params.append('start_date', startDate.toISOString());
    params.append('end_date', endDate.toISOString());
    return apiClient.get<RevenueStatistics>(`/statistics/revenue?${params.toString()}`);
  }
}

export const statisticsService = new StatisticsService(); 