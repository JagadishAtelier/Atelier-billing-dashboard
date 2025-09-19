import axios from 'axios';
import { handleApiError } from '../../utils/errorHandler';

// Create axios instance with default config
const api = axios.create({
  // baseURL: 'http://192.168.40.220:3001/api/v1',
  baseURL: ' http://192.168.1.15:5000/api/v1/masters',   
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ2aXNobnVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6MSwiYnJhbmNoX2lkIjoxLCJkaXZpc2lvbl9pZCI6MSwiZGVwYXJ0bWVudF9pZCI6MSwiaWF0IjoxNzQ4Njc3MDQ1LCJleHAiOjE3ODAyMTMwNDV9.0qf5zUjL8Ki8CDfaAuTui590Fs8f1kQwhu_-oXiYSYk";
    
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFkYzUyMzRlLWVlMWItNDNmOS05NWIxLTYyNzQzZWU4ODYwMiIsImVtYWlsIjoiZ25hbmFwYXJ0aGliYW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6IjJkYzUyMzRlLWVlMWItNDNmOS05NWIxLTYyNzQzZWU4ODYwMiIsImJyYW5jaF9pZCI6IjNkYzUyMzRlLWVlMWItNDNmOS05NWIxLTYyNzQzZWU4ODYwMiIsImRlcGFydG1lbnRfaWQiOiI0ZGM1MjM0ZS1lZTFiLTQzZjktOTViMS02Mjc0M2VlODg2MDIiLCJuYW1lIjoiR25hbmFwYXJ0aGliYW4iLCJpYXQiOjE3NTQ2MjgxMjQsImV4cCI6MTc4NjE2NDEyNH0.hCWPt8P7BsY0O5saUTzkTMxkRvazy_LDjXF7on_bxHA";
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(

  (response) => {
    // Handle success responses (2xx)
    return response;
  },
  (error) => {
    // Handle error responses
    handleApiError(error);
    return Promise.reject(error);
  }
);

// API methods
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;