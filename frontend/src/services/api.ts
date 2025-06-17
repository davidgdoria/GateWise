import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

declare global {
  interface Window {
    env: {
      REACT_APP_API_URL: string;
    };
  }
}

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = api;

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

  // Vehicle methods
  async getVehicles(page: number, size: number): Promise<VehicleResponse> {
    const response = await this.client.get<VehicleResponse>('/vehicles', {
      params: { page, size }
    });
    return response.data;
  }

  async getVehicle(id: number): Promise<Vehicle> {
    const response = await this.client.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const response = await this.client.post<Vehicle>('/vehicles', vehicle);
    return response.data;
  }

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const response = await this.client.put<Vehicle>(`/vehicles/${id}`, vehicle);
    return response.data;
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.client.delete(`/vehicles/${id}`);
  }

  // Plan methods
  async getPlans(page: number, size: number): Promise<PlanResponse> {
    const response = await this.client.get<PlanResponse>('/plans', {
      params: { page, size }
    });
    return response.data;
  }

  async getPlan(id: number): Promise<Plan> {
    const response = await this.client.get<Plan>(`/plans/${id}`);
    return response.data;
  }

  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    const response = await this.client.post<Plan>('/plans', plan);
    return response.data;
  }

  async updatePlan(id: number, plan: Partial<Plan>): Promise<Plan> {
    const response = await this.client.put<Plan>(`/plans/${id}`, plan);
    return response.data;
  }

  async deletePlan(id: number): Promise<void> {
    await this.client.delete(`/plans/${id}`);
  }

  // User methods
  async getUsers(page: number, size: number): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/users', {
      params: { page, size }
    });
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await this.client.post<User>('/users', user);
    return response.data;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me');
    return response.data;
  }
}

export const apiClient = new ApiClient();

// Vehicle endpoints
export const vehicleApi = {
  getVehicles: () => apiClient.getVehicles(1, 10),
  getVehicle: (id: number) => apiClient.getVehicle(id),
  createVehicle: (data: any) => apiClient.createVehicle(data),
  updateVehicle: (id: number, data: any) => apiClient.updateVehicle(id, data),
  deleteVehicle: (id: number) => apiClient.deleteVehicle(id),
};

// User endpoints
export const userApi = {
  getUsers: () => apiClient.getUsers(1, 10),
  getUser: (id: number) => apiClient.getUser(id),
  createUser: (data: any) => apiClient.createUser(data),
  updateUser: (id: number, data: any) => apiClient.updateUser(id, data),
  deleteUser: (id: number) => apiClient.deleteUser(id),
  getCurrentUser: () => apiClient.getCurrentUser(),
  sendPasswordResetEmail: (id: number) => api.post(`/users/${id}/reset-password-token`),
  logout: () => api.post('/users/logout'),
};

// Plans endpoints
export const plansApi = {
  getPlans: () => apiClient.getPlans(1, 10),
  getPlan: (id: number) => apiClient.getPlan(id),
  createPlan: (data: any) => apiClient.createPlan(data),
  updatePlan: (id: number, data: any) => apiClient.updatePlan(id, data),
  deletePlan: (id: number) => apiClient.deletePlan(id),
};

// Parking records endpoints
// export const parkingApi = {
//   getParkingRecords: () => apiClient.get('/parking-records'),
//   getParkingRecord: (id: number) => apiClient.get(`/parking-records/${id}`),
//   createParkingRecord: (data: any) => apiClient.post('/parking-records', data),
//   updateParkingRecord: (id: number, data: any) => apiClient.put(`/parking-records/${id}`, data),
// };

// Alerts endpoints
// export const alertApi = {
//   getAlerts: () => apiClient.getAlerts(1, 10),
//   getAlert: (id: number) => apiClient.getAlert(id),
//   createAlert: (data: any) => apiClient.createAlert(data),
//   updateAlert: (id: number, data: any) => apiClient.updateAlert(id, data),
//   resolveAlert: (id: number) => apiClient.deleteAlert(id),
// };

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  type: string;
}

interface UserResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface Vehicle {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  color: string;
  type: string;
  owner_id: number;
  owner: {
    id: number;
    email: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface VehicleResponse {
  items: Vehicle[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

interface PlanResponse {
  items: Plan[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface ApiClient {
  // Vehicle methods
  getVehicles(page: number, size: number): Promise<VehicleResponse>;
  getVehicle(id: number): Promise<Vehicle>;
  createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;

  // Plan methods
  getPlans(page: number, size: number): Promise<PlanResponse>;
  getPlan(id: number): Promise<Plan>;
  createPlan(plan: Omit<Plan, 'id'>): Promise<Plan>;
  updatePlan(id: number, plan: Partial<Plan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;

  // User methods
  getUsers(page: number, size: number): Promise<UserResponse>;
  getUser(id: number): Promise<User>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getCurrentUser(): Promise<User>;
} 