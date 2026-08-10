import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Eye, Pencil, Trash2, CheckCircle2, XCircle, Star, StarOff, Copy, Search,
  Plus, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Fuel, Gauge,
  DollarSign, Shield, Award, Sparkles, Crown, Users, Clock,
  ArrowUpDown, Car as CarIcon, FileCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import CompleteSaleModal from '@/components/admin/CompleteSaleModal';
import {
  fetchAdminCars, deleteCar, updateCarStatus, updateCarFeatured,
  duplicateCar, bulkDeleteCars, bulkFeatureCars, type CarFilters,
} from '@/api/cars';
import type { Car } from '@/types';

// ============================================
// TYPES & CONSTANTS
// ============================================

const STATUS_COLORS = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Sold: 'bg-red-50 text-red-700 border-red-200',
  Reserved: 'bg-amber-50 text-amber-700 border-amber-200',
};

const STATUS_ICONS = {
  Available: CheckCircle2,
  Sold: XCircle,
  Reserved: Clock,
};

const BRANDS = ['Maruti Suzuki', 'Mahindra', 'Hyundai', 'Toyota', 'Honda', 'Kia', 'MG', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const STATUS_OPTIONS = ['Available', 'Sold', 'Reserved'];

// Builds a truncated page-number list (e.g. 1 … 4 5 6 … 42) instead of
// rendering one button per page, which broke down visually once an
// inventory grew past a handful of pages.
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const delta = 1;
  const pages: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 2) pages.push('ellipsis');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('ellipsis');
  if (total > 1) pages.push(total);

  return pages;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const CarCard = ({ 
  car, 
  selected, 
  onSelect, 
  onStatusChange, 
  onFeatureToggle, 
  onDuplicate, 
  onDelete,
  onSale,
  rowActions 
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-3xl shadow-card border border-transparent hover:border-[#F4B400]/20 transition-all duration-300 overflow-hidden"
    >
      <div className="p-4 flex gap-4">
        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(car._id)}
            className="w-4 h-4 rounded border-line text-[#F4B400] focus:ring-[#F4B400]/20 cursor-pointer"
          />
        </div>

        {/* Image */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface shadow-sm">
            <img 
              src={car.images?.[0]?.url || '/images/placeholder-car.jpg'} 
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-car.jpg';
              }}
            />
          </div>
          {car.isFeatured && (
            <div className="absolute -top-1 -right-1">
              <div className="w-6 h-6 rounded-full bg-[#F4B400] flex items-center justify-center shadow-lg shadow-[#F4B400]/25">
                <Sparkles size={12} className="text-black" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link 
                to={`/cars/${car.slug}`} 
                target="_blank"
                className="group flex items-center gap-2"
              >
                <h3 className="font-semibold text-ink text-sm truncate group-hover:text-[#F4B400] transition-colors">
                  {car.brand} {car.model}
                </h3>
                {car.isFeatured && (
                  <Crown size={12} className="text-[#F4B400] shrink-0" />
                )}
              </Link>
              <p className="text-xs text-body/60 truncate">{car.variant || 'Base Model'}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onFeatureToggle(car._id, !car.isFeatured)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                aria-label={car.isFeatured ? 'Remove featured' : 'Make featured'}
              >
                {car.isFeatured ? (
                  <Star size={16} className="text-[#F4B400] fill-[#F4B400]" />
                ) : (
                  <StarOff size={16} className="text-body/40" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors md:hidden"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="font-bold text-[#F4B400] text-sm">₹{(car.price / 100000).toFixed(2)}L</p>
            <span className="w-px h-3 bg-line" />
            <span className="text-xs text-body/60">{car.manufacturingYear}</span>
            <span className="w-px h-3 bg-line" />
            <span className="text-xs text-body/60">{car.kilometersDriven.toLocaleString()} km</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge status={car.status} />
            <span className="text-xs text-body/50">{car.fuelType}</span>
            <span className="text-xs text-body/50">•</span>
            <span className="text-xs text-body/50">{car.transmission}</span>
          </div>

          {/* Actions */}
          <div className={`flex flex-wrap items-center gap-1 mt-3 pt-3 border-t border-line ${isExpanded ? 'flex' : 'hidden md:flex'}`}>
            <Link 
              to={`/cars/${car.slug}`} 
              target="_blank" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-body/70 hover:text-[#F4B400] hover:bg-[#F4B400]/5 transition-all"
            >
              <Eye size={14} /> View
            </Link>
            <Link 
              to={`/admin/edit/${car._id}`} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-body/70 hover:text-blue-500 hover:bg-blue-50 transition-all"
            >
              <Pencil size={14} /> Edit
            </Link>
            <button
              onClick={() => onDuplicate(car._id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-body/70 hover:text-purple-500 hover:bg-purple-50 transition-all"
            >
              <Copy size={14} /> Duplicate
            </button>
            {car.status !== 'Sold' ? (
              <button
                onClick={() => onSale(car)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-body/70 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <XCircle size={14} /> Mark Sold
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(car._id, 'Available')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-body/70 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <CheckCircle2 size={14} /> Available
              </button>
            )}
            <button
              onClick={() => onDelete(car._id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-body/70 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function ManageCars() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [saleCar, setSaleCar] = useState<Car | null>(null);
  const [brandFilter, setBrandFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CarFilters['status'] | ''>(
    (searchParams.get('status') as CarFilters['status']) || ''
  );
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featuredOnly') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setStatusFilter((searchParams.get('status') as CarFilters['status']) || '');
    setFeaturedOnly(searchParams.get('featuredOnly') === 'true');
    setPage(1);
  }, [searchParams]);

  const filters: CarFilters = useMemo(
    () => ({
      q: search || undefined,
      brand: brandFilter || undefined,
      fuelType: fuelFilter || undefined,
      status: statusFilter || undefined,
      featuredOnly: featuredOnly || undefined,
      page,
      pageSize: 15,
    }),
    [search, brandFilter, fuelFilter, statusFilter, featuredOnly, page]
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-cars', filters],
    queryFn: () => fetchAdminCars(filters),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      setPage(data.pagination.totalPages);
    }
  }, [data, page]);

  // Selection is page/filter-scoped: clear it whenever the visible set of
  // cars changes, so a stale selection from a previous page/filter can't
  // silently linger and mislead a bulk action.
  useEffect(() => {
    setSelected([]);
  }, [filters]);

  const refresh = () => {
    // Also invalidate Analytics/Dashboard so a sale or edit here is
    // reflected immediately instead of waiting out their staleTime.
    queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    refetch();
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    if (!data) return;
    const pageIds = data.cars.map((c) => c._id);
    const allPageIdsSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
    setSelected(allPageIdsSelected ? [] : pageIds);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this car listing? This cannot be undone.')) return;
    try {
      await deleteCar(id);
      toast.success('Car deleted successfully.');
      refresh();
    } catch {
      toast.error('Failed to delete car.');
    }
  };

  const handleStatus = async (id: string, status: 'Available' | 'Reserved') => {
    try {
      await updateCarStatus(id, status);
      toast.success(`Marked as ${status}.`);
      refresh();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      await updateCarFeatured(id, isFeatured);
      toast.success(isFeatured ? 'Car featured!' : 'Car unfeatured.');
      refresh();
    } catch {
      toast.error('Failed to update featured status.');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateCar(id);
      toast.success('Car duplicated successfully!');
      refresh();
    } catch {
      toast.error('Failed to duplicate car.');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} selected car(s)? This cannot be undone.`)) return;
    try {
      await bulkDeleteCars(selected);
      toast.success(`${selected.length} car(s) deleted.`);
      setSelected([]);
      refresh();
    } catch {
      toast.error('Failed to delete selected cars.');
    }
  };

  const handleBulkFeature = async (isFeatured: boolean) => {
    if (selected.length === 0) return;
    try {
      await bulkFeatureCars(selected, isFeatured);
      toast.success(`${selected.length} car(s) updated.`);
      setSelected([]);
      refresh();
    } catch {
      toast.error('Failed to update selected cars.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setBrandFilter('');
    setFuelFilter('');
    setStatusFilter('');
    setFeaturedOnly(false);
    setPage(1);
  };

  const totalCars = data?.pagination?.total || 0;

  return (
    <AdminLayout title="Manage Cars">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <CarIcon size={22} className="text-[#F4B400]" />
              Vehicle Inventory
              <span className="text-sm font-normal text-body/50 ml-2">
                ({totalCars} cars)
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/upload"
              className="inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-4 py-2 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#F4B400]/25 active:scale-95"
            >
              <Plus size={18} />
              Add Car
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-all hover:border-[#F4B400]/30 hover:bg-[#F4B400]/5"
            >
              <Filter size={18} />
              Filters
              <span className="text-xs text-body/50">
                {brandFilter || fuelFilter || statusFilter || featuredOnly ? (
                  <span className="w-2 h-2 rounded-full bg-[#F4B400] inline-block ml-1" />
                ) : null}
              </span>
            </button>
            <button
              onClick={refresh}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-line bg-white text-body transition-all hover:border-[#F4B400]/30 hover:bg-[#F4B400]/5"
              aria-label="Refresh"
            >
              <RefreshCw size={18} className="transition-transform hover:rotate-180" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl shadow-card p-4 border border-line">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
                    <input
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search cars..."
                      className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 outline-none transition-all"
                    />
                  </div>
                  <select
                    value={brandFilter}
                    onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 outline-none transition-all"
                  >
                    <option value="">All Brands</option>
                    {BRANDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  <select
                    value={fuelFilter}
                    onChange={(e) => { setFuelFilter(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 outline-none transition-all"
                  >
                    <option value="">All Fuel</option>
                    {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as CarFilters['status'] | ''); setPage(1); }}
                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 outline-none transition-all"
                  >
                    <option value="">All Status</option>
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => { setFeaturedOnly(e.target.checked); setPage(1); }}
                        className="w-4 h-4 rounded border-line text-[#F4B400] focus:ring-[#F4B400]/20"
                      />
                      <Sparkles size={14} className="text-[#F4B400]" />
                      Featured only
                    </label>
                    {(brandFilter || fuelFilter || statusFilter || featuredOnly || search) && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-[#F4B400] font-medium hover:underline whitespace-nowrap"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F4B400]/5 rounded-3xl border border-[#F4B400]/20 p-3 flex flex-wrap items-center gap-3"
          >
            <span className="font-medium text-sm text-ink">{selected.length} selected</span>
            <span className="w-px h-5 bg-line" />
            <button onClick={() => handleBulkFeature(true)} className="text-sm text-[#F4B400] font-medium hover:underline">
              <Sparkles size={14} className="inline mr-1" /> Feature
            </button>
            <button onClick={() => handleBulkFeature(false)} className="text-sm text-body/60 font-medium hover:text-ink">
              Unfeature
            </button>
            <span className="w-px h-5 bg-line" />
            <button onClick={handleBulkDelete} className="text-sm text-red-500 font-medium hover:underline">
              Delete All
            </button>
            <button 
              onClick={() => setSelected([])}
              className="text-xs text-body/40 hover:text-body ml-auto"
            >
              Clear selection
            </button>
          </motion.div>
        )}

        {/* Cars Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F4B400] border-t-transparent" />
          </div>
        ) : data && data.cars.length > 0 ? (
          <div className="space-y-3">
            <div className="hidden md:block">
              <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-line">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-body/60 uppercase tracking-wider border-b border-line">
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={data.cars.length > 0 && data.cars.every((c) => selected.includes(c._id))}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-line text-[#F4B400] focus:ring-[#F4B400]/20"
                          />
                        </th>
                        <th className="px-4 py-3">Car</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">KM</th>
                        <th className="px-4 py-3">Fuel</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Featured</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.cars.map((car) => (
                        <motion.tr
                          key={car._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-line last:border-0 hover:bg-surface/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.includes(car._id)}
                              onChange={() => toggleSelect(car._id)}
                              className="w-4 h-4 rounded border-line text-[#F4B400] focus:ring-[#F4B400]/20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface shrink-0">
                                <img
                                  src={car.images?.[0]?.url || '/images/placeholder-car.jpg'}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-car.jpg';
                                  }}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-ink">{car.brand} {car.model}</p>
                                <p className="text-xs text-body/50">{car.variant || 'Base'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#F4B400]">
                            ₹{(car.price / 100000).toFixed(2)}L
                          </td>
                          <td className="px-4 py-3 text-body">{car.manufacturingYear}</td>
                          <td className="px-4 py-3 text-body">{car.kilometersDriven.toLocaleString()}</td>
                          <td className="px-4 py-3 text-body">{car.fuelType}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={car.status} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleFeature(car._id, !car.isFeatured)}
                              className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                            >
                              {car.isFeatured ? (
                                <Star size={18} className="text-[#F4B400] fill-[#F4B400]" />
                              ) : (
                                <StarOff size={18} className="text-body/30" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/cars/${car.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-surface text-body/60 hover:text-[#F4B400] transition-colors" title="View">
                                <Eye size={16} />
                              </Link>
                              <Link to={`/admin/edit/${car._id}`} className="p-1.5 rounded-lg hover:bg-surface text-body/60 hover:text-blue-500 transition-colors" title="Edit">
                                <Pencil size={16} />
                              </Link>
                              <button onClick={() => handleDuplicate(car._id)} className="p-1.5 rounded-lg hover:bg-surface text-body/60 hover:text-purple-500 transition-colors" title="Duplicate">
                                <Copy size={16} />
                              </button>
                              {car.status !== 'Sold' ? (
                                <button onClick={() => setSaleCar(car)} className="p-1.5 rounded-lg hover:bg-surface text-body/60 hover:text-red-500 transition-colors" title="Mark Sold">
                                  <XCircle size={16} />
                                </button>
                              ) : (
                                <button onClick={() => handleStatus(car._id, 'Available')} className="p-1.5 rounded-lg hover:bg-surface text-body/60 hover:text-emerald-500 transition-colors" title="Mark Available">
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                              <button onClick={() => handleDelete(car._id)} className="p-1.5 rounded-lg hover:bg-surface text-body/60 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {data.cars.map((car) => (
                <CarCard
                  key={car._id}
                  car={car}
                  selected={selected.includes(car._id)}
                  onSelect={toggleSelect}
                  onStatusChange={handleStatus}
                  onFeatureToggle={handleFeature}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onSale={setSaleCar}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card p-12 text-center border border-line">
            <CarIcon size={48} className="mx-auto text-body/20 mb-4" />
            <h3 className="text-lg font-semibold text-ink mb-2">No cars found</h3>
            <p className="text-sm text-body/60">
              {search || brandFilter || fuelFilter || statusFilter || featuredOnly
                ? 'Try adjusting your filters'
                : 'Start by adding your first vehicle'}
            </p>
            <Link
              to="/admin/upload"
              className="inline-flex items-center gap-2 mt-4 rounded-full bg-[#F4B400] px-6 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#F4B400]/25"
            >
              <Plus size={18} />
              Add Car
            </Link>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 bg-white rounded-3xl shadow-card border border-line">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="w-9 h-9 rounded-full text-sm font-medium transition-all bg-surface text-ink hover:bg-line disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface"
            >
              <ChevronLeft size={16} className="mx-auto" />
            </motion.button>

            {getPageNumbers(page, data.pagination.totalPages).map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-body/50">
                  …
                </span>
              ) : (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    page === p
                      ? 'bg-[#F4B400] text-black shadow-lg shadow-[#F4B400]/25'
                      : 'bg-surface text-ink hover:bg-line'
                  }`}
                >
                  {p}
                </motion.button>
              )
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              aria-label="Next page"
              className="w-9 h-9 rounded-full text-sm font-medium transition-all bg-surface text-ink hover:bg-line disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface"
            >
              <ChevronRight size={16} className="mx-auto" />
            </motion.button>
          </div>
        )}
      </motion.div>

      <CompleteSaleModal car={saleCar} onClose={() => setSaleCar(null)} onComplete={refresh} />
    </AdminLayout>
  );
}