import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

declare global {
  interface Window {
    env: {
      REACT_APP_API_URL: string;
    };
  }
}

const API_URL = window.env?.REACT_APP_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// Vehicle endpoints
export const vehicleApi = {
  getVehicles: () => apiClient.get('/vehicles'),
  getVehicle: (id: number) => apiClient.get(`/vehicles/${id}`),
  createVehicle: (data: any) => apiClient.post('/vehicles', data),
  updateVehicle: (id: number, data: any) => apiClient.put(`/vehicles/${id}`, data),
  deleteVehicle: (id: number) => apiClient.delete(`/vehicles/${id}`),
};

// Parking records endpoints
export const parkingApi = {
  getParkingRecords: () => apiClient.get('/parking-records'),
  getParkingRecord: (id: number) => apiClient.get(`/parking-records/${id}`),
  createParkingRecord: (data: any) => apiClient.post('/parking-records', data),
  updateParkingRecord: (id: number, data: any) => apiClient.put(`/parking-records/${id}`, data),
};

// Alerts endpoints
export const alertApi = {
  getAlerts: () => apiClient.get('/alerts'),
  getAlert: (id: number) => apiClient.get(`/alerts/${id}`),
  createAlert: (data: any) => apiClient.post('/alerts', data),
  updateAlert: (id: number, data: any) => apiClient.put(`/alerts/${id}`, data),
  resolveAlert: (id: number) => apiClient.post(`/alerts/${id}/resolve`),
};

// Statistics endpoints
export const statsApi = {
  getDashboardStats: () => apiClient.get('/stats/dashboard'),
  getOccupancyTrend: (period: string) => apiClient.get(`/stats/occupancy?period=${period}`),
  getVehicleStats: () => apiClient.get('/stats/vehicles'),
}; 