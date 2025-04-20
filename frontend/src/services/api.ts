import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vehicle endpoints
export const vehicleApi = {
  getVehicles: () => api.get('/vehicles'),
  getVehicle: (id: number) => api.get(`/vehicles/${id}`),
  createVehicle: (data: any) => api.post('/vehicles', data),
  updateVehicle: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id: number) => api.delete(`/vehicles/${id}`),
};

// Parking records endpoints
export const parkingApi = {
  getParkingRecords: () => api.get('/parking-records'),
  getParkingRecord: (id: number) => api.get(`/parking-records/${id}`),
  createParkingRecord: (data: any) => api.post('/parking-records', data),
  updateParkingRecord: (id: number, data: any) => api.put(`/parking-records/${id}`, data),
};

// Alerts endpoints
export const alertApi = {
  getAlerts: () => api.get('/alerts'),
  getAlert: (id: number) => api.get(`/alerts/${id}`),
  createAlert: (data: any) => api.post('/alerts', data),
  updateAlert: (id: number, data: any) => api.put(`/alerts/${id}`, data),
  resolveAlert: (id: number) => api.post(`/alerts/${id}/resolve`),
};

// Statistics endpoints
export const statsApi = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getOccupancyTrend: (period: string) => api.get(`/stats/occupancy?period=${period}`),
  getVehicleStats: () => api.get('/stats/vehicles'),
};

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 