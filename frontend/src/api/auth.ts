import { api } from './client';
import type { AdminUser } from '@/types';

export async function loginAdmin(email: string, password: string, rememberMe: boolean) {
  const { data } = await api.post<{ token: string; user: AdminUser }>('/admin/auth/login', {
    email,
    password,
    rememberMe,
  });
  // Store token as a fallback for the Authorization header path.
  localStorage.setItem('BALAJI CARS_admin_token', data.token);
  return data.user;
}

export async function logoutAdmin() {
  await api.post('/admin/auth/logout');
  localStorage.removeItem('BALAJI CARS_admin_token');
}

export async function fetchCurrentAdmin() {
  const { data } = await api.get<{ user: AdminUser }>('/admin/auth/me');
  return data.user;
}

export async function requestPasswordReset(email: string) {
  const { data } = await api.post<{ message: string }>('/admin/auth/forgot-password', { email });
  return data.message;
}
