import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

declare global {
  interface Window {
    env: {
      REACT_APP_API_URL: string;
    };
  }
}

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('access_token');
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
          Cookies.remove('access_token');
          // window.location.href = '/login'; // <-- commented out to disable auto-redirect
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
  getVehicles: () => apiClient.get('/vehicles/'),
  getVehicle: (id: number) => apiClient.get(`/vehicles/${id}/`),
  createVehicle: (data: any) => apiClient.post('/vehicles/', data),
  updateVehicle: (id: number, data: any) => apiClient.put(`/vehicles/${id}/`, data),
  deleteVehicle: (id: number) => apiClient.delete(`/vehicles/${id}/`),
};

// Parking records endpoints
// export const parkingApi = {
//   getParkingRecords: () => apiClient.get('/parking-records'),
//   getParkingRecord: (id: number) => apiClient.get(`/parking-records/${id}`),
//   createParkingRecord: (data: any) => apiClient.post('/parking-records', data),
//   updateParkingRecord: (id: number, data: any) => apiClient.put(`/parking-records/${id}`, data),
// };

// Alerts endpoints
export const alertApi = {
  getAlerts: () => apiClient.get('/alerts'),
  getAlert: (id: number) => apiClient.get(`/alerts/${id}`),
  createAlert: (data: any) => apiClient.post('/alerts', data),
  updateAlert: (id: number, data: any) => apiClient.put(`/alerts/${id}`, data),
  resolveAlert: (id: number) => apiClient.post(`/alerts/${id}/resolve`),
};

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
}); 