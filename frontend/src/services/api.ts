import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('newsportal_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto logout on login or me attempts to avoid loops
      const url = error.config?.url;
      if (!url?.includes('/auth/login') && !url?.includes('/auth/me')) {
        localStorage.removeItem('newsportal_token');
        localStorage.removeItem('newsportal_user');
      }
    }
    return Promise.reject(error);
  }
);
