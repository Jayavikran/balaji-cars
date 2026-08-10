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

export async function updateEnquiryStatus(id: string, status: Enquiry['status']) {
  const { data } = await api.patch<{ enquiry: Enquiry }>(`/admin/enquiries/${id}/status`, { status });
  return data.enquiry;
}

export async function deleteEnquiry(id: string) {
  await api.delete(`/admin/enquiries/${id}`);
}