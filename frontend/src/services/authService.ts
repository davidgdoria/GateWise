import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}`; // Uses docker-compose/env variable

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/refresh-token`);
        
        const { access_token } = response.data;
        
        // Update token in cookie
        Cookies.set('access_token', access_token);
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear token and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('user_type');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication service
const authService = {
  // Login user
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      Cookies.set('access_token', response.data.access_token);
      Cookies.set('user_type', response.data.user_type);
    }
    
    return response.data;
  },
  
  // Logout user
  logout: () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('user_type', { path: '/' });
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('access_token');
  },
  
  // Request password reset
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/password-reset/request', { email });
    return response.data;
  },
  
  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/password-reset/verify', {
      token,
      new_password: newPassword
    });
    return response.data;
  }
};

export default authService; 