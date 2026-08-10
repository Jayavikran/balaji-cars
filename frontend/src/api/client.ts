import axios from 'axios';

// ✅ Use the full backend URL
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '/api' : '/api');

// Auth relies solely on the httpOnly `adminToken` cookie set by the backend
// (see authController.js). `withCredentials: true` ensures that cookie is
// sent with every request. There is intentionally no token stored in
// localStorage or attached via an Authorization header — an httpOnly
// cookie can't be read by JavaScript, which is what protects it from theft
// via XSS.
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);