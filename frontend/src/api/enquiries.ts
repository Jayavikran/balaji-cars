// api/enquiries.ts
import { api } from './client';
import type { Enquiry, Pagination, SiteSettings } from '@/types';

// Public settings — backend exposes this at GET /api/settings (see settingsRoutes.js)
export async function fetchPublicSettings() {
  const { data } = await api.get<{ settings: SiteSettings }>('/settings');
  return data.settings;
}

// Admin only — PUT /api/admin/settings
export async function updateSettings(payload: Partial<SiteSettings>) {
  const { data } = await api.put<{ settings: SiteSettings }>('/admin/settings', payload);
  return data.settings;
}

export async function submitEnquiry(data: {
  carId: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  message?: string;
}) {
  const { data: response } = await api.post<{ enquiry: Enquiry }>('/enquiries', data);
  return response.enquiry;
}

export async function fetchAdminEnquiries(page = 1, pageSize = 20, status?: string) {
  const { data } = await api.get<{ enquiries: Enquiry[]; pagination: Pagination }>('/admin/enquiries', {
    params: { page, pageSize, status },
  });
  return data;
}

// NOTE: the functions below aren't called anywhere yet, and the backend in
// this project doesn't define matching routes for them (car/:carId,
// phone/:phone, recent, stats, bulk-delete, bulk-status, export). They won't
// break the build, but they'll 404 if you wire them up — add the
// corresponding routes/controllers in backend/src/routes/adminEnquiryRoutes.js
// and enquiryController.js first.

export async function fetchEnquiryById(id: string) {
  const { data } = await api.get<{ enquiry: Enquiry }>(`/admin/enquiries/${id}`);
  return data.enquiry;
}

export async function fetchEnquiriesByCar(carId: string) {
  const { data } = await api.get<{ enquiries: Enquiry[] }>(`/admin/enquiries/car/${carId}`);
  return data.enquiries;
}

export async function fetchEnquiriesByPhone(phone: string) {
  const { data } = await api.get<{ enquiries: Enquiry[] }>(`/admin/enquiries/phone/${phone}`);
  return data.enquiries;
}

export async function fetchRecentEnquiries(limit = 10) {
  const { data } = await api.get<{ enquiries: Enquiry[] }>('/admin/enquiries/recent', {
    params: { limit },
  });
  return data.enquiries;
}

export async function fetchEnquiryStats() {
  const { data } = await api.get('/admin/enquiries/stats');
  return data;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status']) {
  const { data } = await api.patch<{ enquiry: Enquiry }>(`/admin/enquiries/${id}/status`, { status });
  return data.enquiry;
}

export async function deleteEnquiry(id: string) {
  await api.delete(`/admin/enquiries/${id}`);
}

export async function bulkDeleteEnquiries(ids: string[]) {
  await api.post('/admin/enquiries/bulk-delete', { ids });
}

export async function bulkUpdateEnquiryStatus(ids: string[], status: Enquiry['status']) {
  await api.patch('/admin/enquiries/bulk-status', { ids, status });
}

export async function exportEnquiries(filters?: { status?: string; from?: string; to?: string }) {
  const { data } = await api.get('/admin/enquiries/export', {
    params: filters,
    responseType: 'blob',
  });
  return data;
}