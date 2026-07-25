import { api } from './client';
import type { SiteSettings } from '@/types';

export async function fetchPublicSettings() {
  const { data } = await api.get<{ settings: SiteSettings }>('/settings');
  return data.settings;
}

export async function updateSettings(payload: Partial<SiteSettings>) {
  const { data } = await api.put<{ settings: SiteSettings }>('/settings', payload);
  return data.settings;
}