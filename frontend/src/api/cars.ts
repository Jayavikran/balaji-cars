import { api } from './client';
import type { Car, Pagination } from '@/types';

export interface CarFilters {
  q?: string;
  brand?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  owner?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minKm?: number;
  maxKm?: number;
  manufacturingYear?: number;
  registrationYear?: number;
  seats?: number;
  status?: 'Available' | 'Sold' | 'Reserved';
  insuranceActiveOnly?: boolean;
  fcValidOnly?: boolean;
  featuredOnly?: boolean;
  availableOnly?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchCars(filters: CarFilters = {}) {
  const { data } = await api.get<{ cars: Car[]; pagination: Pagination }>('/cars', { params: filters });
  return data;
}

export async function fetchCarByIdOrSlug(idOrSlug: string) {
  const { data } = await api.get<{ car: Car }>(`/cars/${idOrSlug}`);
  return data.car;
}

export async function fetchSimilarCars(carId: string, limit = 8) {
  const { data } = await api.get<{ total: number; cars: Car[] }>(`/cars/${carId}/similar`, { params: { limit } });
  return data;
}

export async function fetchSearchSuggestions(q: string) {
  const { data } = await api.get<{ suggestions: { label: string; slug: string }[] }>('/cars/suggestions', {
    params: { q },
  });
  return data.suggestions;
}

// ---- Admin ----

export async function fetchAdminCars(filters: CarFilters & { includeSold?: boolean } = {}) {
  const { data } = await api.get<{ cars: Car[]; pagination: Pagination }>('/admin/cars', { params: filters });
  return data;
}

export async function createCar(formData: FormData) {
  const { data } = await api.post<{ car: Car }>('/admin/cars', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.car;
}

export async function updateCar(id: string, formData: FormData) {
  const { data } = await api.put<{ car: Car }>(`/admin/cars/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.car;
}

export async function deleteCar(id: string) {
  await api.delete(`/admin/cars/${id}`);
}

export interface CompleteSalePayload {
  soldPrice: number;
  purchasePrice?: number;
  buyerName: string;
  buyerPhone?: string;
  saleDate?: string;
  paymentMethod?: string;
  financeCompany?: string;
  salesExecutive?: string;
  notes?: string;
}

export async function updateCarStatus(id: string, status: 'Available' | 'Reserved') {
  const { data } = await api.patch<{ car: Car }>(`/admin/cars/${id}/status`, { status });
  return data.car;
}

export async function completeSale(id: string, payload: CompleteSalePayload) {
  const { data } = await api.patch<{ car: Car }>(`/admin/cars/${id}/complete-sale`, payload);
  return data.car;
}

export async function updateCarFeatured(id: string, isFeatured: boolean) {
  const { data } = await api.patch<{ car: Car }>(`/admin/cars/${id}/feature`, { isFeatured });
  return data.car;
}

export async function duplicateCar(id: string) {
  const { data } = await api.post<{ car: Car }>(`/admin/cars/${id}/duplicate`);
  return data.car;
}

export async function bulkDeleteCars(ids: string[]) {
  await api.post('/admin/cars/bulk-delete', { ids });
}

export async function bulkFeatureCars(ids: string[], isFeatured: boolean) {
  await api.post('/admin/cars/bulk-feature', { ids, isFeatured });
}

export async function fetchDashboardStats() {
  const { data } = await api.get('/admin/dashboard/stats');
  return data as {
    stats: { totalCars: number; availableCars: number; soldCars: number; reservedCars: number; featuredCars: number };
    recentUploads: Car[];
    salesStats: { _id: { year: number; month: number }; count: number; revenue: number }[];
    revenue: {
      today: { revenue: number; profit: number; count: number };
      month: { revenue: number; profit: number; count: number };
      year: { revenue: number; profit: number; count: number };
      lifetime: { revenue: number; profit: number; count: number };
      averageSellingPrice: number;
      averageProfit: number;
    };
  };
}

export interface AnalyticsData {
  revenueByBrand: { brand: string; revenue: number; profit: number; unitsSold: number }[];
  topSellingModels: { brand: string; model: string; unitsSold: number; revenue: number }[];
  fuelDistribution: { fuelType: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  revenueByExecutive: { salesExecutive: string; revenue: number; unitsSold: number }[];
}

export async function fetchAnalytics() {
  const { data } = await api.get<AnalyticsData>('/admin/analytics');
  return data;
}
