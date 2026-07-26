import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Eye, Pencil, Trash2, CheckCircle2, XCircle, Star, StarOff, Copy, Search,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import CompleteSaleModal from '@/components/admin/CompleteSaleModal';
import {
  fetchAdminCars, deleteCar, updateCarStatus, updateCarFeatured,
  duplicateCar, bulkDeleteCars, bulkFeatureCars, type CarFilters,
} from '@/api/cars';
import type { Car } from '@/types';

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

  // Re-read status/featuredOnly whenever the URL changes. Without this,
  // clicking a sidebar link like "Sold Cars" (/admin/cars?status=Sold)
  // while already on /admin/cars does nothing — React Router doesn't
  // remount the page for a query-string-only navigation, so the state
  // above (which only reads the URL once, on first mount) would silently
  // stay on whatever filter was showing before.
  useEffect(() => {
    setStatusFilter((searchParams.get('status') as CarFilters['status']) || '');
    setFeaturedOnly(searchParams.get('featuredOnly') === 'true');
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-cars', filters],
    queryFn: () => fetchAdminCars(filters),
  });

  // If a delete/bulk-delete removes the only car(s) on the current page,
  // the table would otherwise be stuck showing "No cars found" on a page
  // that no longer exists instead of falling back to the last real page.
  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      setPage(data.pagination.totalPages);
    }
  }, [data, page]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-cars'] });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    if (!data) return;
    setSelected(selected.length === data.cars.length ? [] : data.cars.map((c) => c._id));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this car listing? This cannot be undone.')) return;
    await deleteCar(id);
    toast.success('Car deleted.');
    refresh();
  };

  const handleStatus = async (id: string, status: 'Available' | 'Reserved') => {
    await updateCarStatus(id, status);
    toast.success(`Marked as ${status}.`);
    refresh();
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    await updateCarFeatured(id, isFeatured);
    toast.success(isFeatured ? 'Featured.' : 'Unfeatured.');
    refresh();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateCar(id);
    toast.success('Car duplicated.');
    refresh();
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} selected car(s)?`)) return;
    await bulkDeleteCars(selected);
    toast.success('Selected cars deleted.');
    setSelected([]);
    refresh();
  };

  const handleBulkFeature = async (isFeatured: boolean) => {
    if (selected.length === 0) return;
    await bulkFeatureCars(selected, isFeatured);
    toast.success('Selected cars updated.');
    setSelected([]);
    refresh();
  };

  const rowActions = (car: Car) => (
    <>
      <Link to={`/cars/${car.slug}`} target="_blank" title="View" className="hover:text-navy"><Eye size={15} /></Link>
      <Link to={`/admin/edit/${car._id}`} title="Edit" className="hover:text-navy"><Pencil size={15} /></Link>
      <button onClick={() => handleDuplicate(car._id)} title="Duplicate" className="hover:text-navy"><Copy size={15} /></button>
      {car.status !== 'Sold' ? (
        <button onClick={() => setSaleCar(car)} title="Mark Sold" className="hover:text-red-500"><XCircle size={15} /></button>
      ) : (
        <button onClick={() => handleStatus(car._id, 'Available')} title="Mark Available" className="hover:text-emerald"><CheckCircle2 size={15} /></button>
      )}
      <button onClick={() => handleDelete(car._id)} title="Delete" className="hover:text-red-500"><Trash2 size={15} /></button>
    </>
  );

  return (
    <AdminLayout title="Manage Cars">
      <div className="bg-white rounded-2xl md:rounded-card shadow-card">
        {/* Filters toolbar */}
        <div className="p-3 sm:p-4 border-b border-line flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search cars by brand, model, variant..."
              className="w-full bg-surface rounded-full pl-9 pr-4 py-2.5 sm:py-2 text-sm border border-transparent focus:border-navy focus:bg-white"
            />
          </div>
          <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }} className="input !w-[calc(50%-5px)] sm:!w-auto text-sm">
            <option value="">All Brands</option>
            {['Maruti Suzuki', 'Mahindra', 'Hyundai', 'Toyota', 'Honda', 'Kia', 'MG', 'Volkswagen'].map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={fuelFilter} onChange={(e) => { setFuelFilter(e.target.value); setPage(1); }} className="input !w-[calc(50%-5px)] sm:!w-auto text-sm">
            <option value="">All Fuel</option>
            {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => <option key={f}>{f}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as CarFilters['status'] | ''); setPage(1); }} className="input !w-full sm:!w-auto text-sm">
            <option value="">All Status</option>
            {['Available', 'Sold', 'Reserved'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Bulk actions bar */}
        {selected.length > 0 && (
          <div className="px-3 sm:px-4 py-2.5 bg-emerald/5 border-b border-line flex items-center gap-3 sm:gap-4 text-xs sm:text-sm overflow-x-auto">
            <span className="font-medium text-ink shrink-0">{selected.length} selected</span>
            <button onClick={() => handleBulkFeature(true)} className="text-navy hover:underline shrink-0">Bulk Feature</button>
            <button onClick={() => handleBulkFeature(false)} className="text-navy hover:underline shrink-0">Bulk Unfeature</button>
            <button onClick={handleBulkDelete} className="text-red-600 hover:underline shrink-0">Bulk Delete</button>
          </div>
        )}

        {/* Desktop / tablet: table, unchanged */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-body uppercase tracking-wide border-b border-line">
                <th className="p-4"><input type="checkbox" checked={!!data && selected.length === data.cars.length && data.cars.length > 0} onChange={toggleSelectAll} /></th>
                <th className="p-4">Image</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Model</th>
                <th className="p-4">Price</th>
                <th className="p-4">Fuel</th>
                <th className="p-4">Year</th>
                <th className="p-4">KM</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={11} className="p-8 text-center text-body">Loading...</td></tr>
              ) : data && data.cars.length > 0 ? (
                data.cars.map((car) => (
                  <tr key={car._id} className="border-b border-line last:border-0 hover:bg-surface/50">
                    <td className="p-4"><input type="checkbox" checked={selected.includes(car._id)} onChange={() => toggleSelect(car._id)} /></td>
                    <td className="p-4">
                      <img src={car.images?.[0]?.url} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface" />
                    </td>
                    <td className="p-4 font-medium text-ink">{car.brand}</td>
                    <td className="p-4 text-body">{car.model} {car.variant}</td>
                    <td className="p-4 font-semibold text-emerald-dark">₹{(car.price / 100000).toFixed(2)}L</td>
                    <td className="p-4 text-body">{car.fuelType}</td>
                    <td className="p-4 text-body">{car.manufacturingYear}</td>
                    <td className="p-4 text-body">{car.kilometersDriven.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`badge ${car.status === 'Available' ? 'badge-available' : car.status === 'Reserved' ? 'badge-reserved' : 'badge-sold'}`}>{car.status}</span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleFeature(car._id, !car.isFeatured)}>
                        {car.isFeatured ? <Star size={16} className="text-amber fill-amber" /> : <StarOff size={16} className="text-body" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-body">{rowActions(car)}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={11} className="p-10 text-center text-body">No cars found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per vehicle instead of a horizontally-scrolling table */}
        <div className="md:hidden">
          {isLoading ? (
            <p className="p-8 text-center text-body text-sm">Loading...</p>
          ) : data && data.cars.length > 0 ? (
            <div className="p-3 space-y-3">
              <label className="flex items-center gap-2 text-xs text-body px-1">
                <input
                  type="checkbox"
                  checked={selected.length === data.cars.length && data.cars.length > 0}
                  onChange={toggleSelectAll}
                />
                Select all on this page
              </label>
              {data.cars.map((car) => (
                <div key={car._id} className="border border-line rounded-2xl p-3 flex gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(car._id)}
                    onChange={() => toggleSelect(car._id)}
                    className="mt-1 shrink-0"
                  />
                  <img src={car.images?.[0]?.url} alt="" className="w-16 h-16 rounded-xl object-cover bg-surface shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-ink truncate">{car.brand} {car.model}</p>
                        <p className="text-xs text-body truncate">{car.variant}</p>
                      </div>
                      <button onClick={() => handleFeature(car._id, !car.isFeatured)} className="shrink-0" aria-label="Toggle featured">
                        {car.isFeatured ? <Star size={16} className="text-amber fill-amber" /> : <StarOff size={16} className="text-body" />}
                      </button>
                    </div>
                    <p className="font-semibold text-sm text-emerald-dark mt-1">₹{(car.price / 100000).toFixed(2)}L</p>
                    <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                      <span className={`badge !text-[10px] !px-2 !py-0.5 ${car.status === 'Available' ? 'badge-available' : car.status === 'Reserved' ? 'badge-reserved' : 'badge-sold'}`}>{car.status}</span>
                      <span className="text-[11px] text-body">{car.fuelType}</span>
                      <span className="text-[11px] text-body">•</span>
                      <span className="text-[11px] text-body">{car.manufacturingYear}</span>
                    </div>
                    <div className="flex items-center gap-3 text-body mt-2.5 pt-2.5 border-t border-line">
                      {rowActions(car)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-10 text-center text-body text-sm">No cars found.</p>
          )}
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-line flex-wrap">
            {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-full text-xs font-medium ${page === i + 1 ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-line'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <CompleteSaleModal car={saleCar} onClose={() => setSaleCar(null)} onComplete={refresh} />
    </AdminLayout>
  );
}
