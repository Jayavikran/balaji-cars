import { api } from './client';
import type { AdminUser } from '@/types';

export async function loginAdmin(email: string, password: string, rememberMe: boolean) {
  // The backend sets an httpOnly `adminToken` cookie on successful login;
  // that cookie is the sole auth mechanism, so nothing needs to be stored
  // client-side here.
  const { data } = await api.post<{ token: string; user: AdminUser }>('/admin/auth/login', {
    email,
    password,
    rememberMe,
  });
  return data.user;
}

export async function logoutAdmin() {
  await api.post('/admin/auth/logout');
}

export async function fetchCurrentAdmin() {
  const { data } = await api.get<{ user: AdminUser }>('/admin/auth/me');
  return data.user;
}

export async function requestPasswordReset(email: string) {
  const { data } = await api.post<{ message: string }>('/admin/auth/forgot-password', { email });
  return data.message;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post<{ message: string }>(`/admin/auth/reset-password/${token}`, { password });
  return data.message;
}
