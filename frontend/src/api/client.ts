import axios from 'axios';

// Vite dev server proxies /api -> http://localhost:5000 (see vite.config.ts).
// In production, set VITE_API_URL to your deployed backend origin.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true, // sends the httpOnly adminToken cookie
});

// Fallback: also attach a bearer token if present (useful for non-cookie clients).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('BALAJI CARS_admin_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('BALAJI CARS_admin_token');
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
