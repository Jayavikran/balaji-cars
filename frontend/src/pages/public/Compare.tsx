import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { X, ShieldCheck, ArrowLeft } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useCompare } from '@/hooks/useCompare';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Seo from '@/components/shared/Seo';
import { fetchCarByIdOrSlug } from '@/api/cars';
import { optimizeImage } from '@/utils/optimizeImage';
import type { Car } from '@/types';

function formatPrice(price?: number) {
  if (price === undefined) return '—';
  return `₹${(price / 100000).toFixed(2)} Lakh`;
}

const ROWS: { label: string; render: (car: Car) => React.ReactNode }[] = [
  { label: 'Price', render: (c) => <span className="price-tag text-base">{formatPrice(c.price)}</span> },
  { label: 'Mileage', render: (c) => (c.mileage ? `${c.mileage} km/l` : '—') },
  { label: 'Fuel', render: (c) => c.fuelType },
  { label: 'Transmission', render: (c) => c.transmission },
  { label: 'Engine', render: (c) => (c.engineCC ? `${c.engineCC} cc` : '—') },
  { label: 'Power', render: () => '—' },
  { label: 'Seats', render: (c) => c.seats ?? '—' },
  { label: 'Owner', render: (c) => c.owner },
  { label: 'Kilometers Driven', render: (c) => `${c.kilometersDriven.toLocaleString('en-IN')} km` },
  {
    label: 'Insurance',
    render: (c) => (c.insuranceActive
      ? <span className="inline-flex items-center gap-1 text-emerald-dark dark:text-emerald"><ShieldCheck size={13} /> Active</span>
      : <span className="text-body">Expired</span>),
  },
  { label: 'Rating', render: () => '—' },
  {
    label: 'Features',
    render: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.features?.length ? c.features.map((f) => (
          <span key={f} className="badge bg-surface dark:bg-white/5 text-ink dark:text-white/80 text-[10px]">{f}</span>
        )) : '—'}
      </div>
    ),
  },
];

export default function Compare() {
  const { compareList, removeFromCompare } = useCompare();
  const { data: settings } = useSiteSettings();

  const results = useQueries({
    queries: compareList.map((c) => ({
      queryKey: ['car', c._id],
      queryFn: () => fetchCarByIdOrSlug(c._id),
    })),
  });

  const cars = results.map((r) => r.data).filter((c): c is Car => Boolean(c));
  const isLoading = results.some((r) => r.isLoading);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`Compare Cars | ${settings?.companyName || 'BALAJI CARS'}`}
        description="Compare vehicle specs, pricing, and features side by side."
        noindex
      />
      <Header settings={settings} search="" onSearchChange={() => {}} sort="newest" onSortChange={() => {}} onOpenFilters={() => {}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-body hover:text-navy dark:hover:text-white mb-4">
          <ArrowLeft size={15} /> Back to listings
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-6">Compare Cars</h1>

        {compareList.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-line dark:border-white/10 rounded-card">
            <p className="text-body">No cars selected. Add up to 3 cars to compare from any car card.</p>
            <Link to="/" className="btn-primary inline-flex mt-4">Browse Cars</Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {compareList.map((c) => <div key={c._id} className="rounded-card bg-surface dark:bg-white/5 h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr>
                  <th className="w-40" />
                  {cars.map((car) => (
                    <th key={car._id} className="p-3 align-top">
                      <div className="relative surface-card rounded-card p-3">
                        <button
                          onClick={() => removeFromCompare(car._id)}
                          aria-label={`Remove ${car.brand} ${car.model}`}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-black/40 flex items-center justify-center"
                        >
                          <X size={13} />
                        </button>
                        <img src={optimizeImage(car.images?.[0]?.url, 400)} alt="" className="w-full aspect-[4/3] object-cover rounded-xl mb-2" />
                        <p className="font-display font-semibold text-sm text-ink dark:text-white truncate">{car.brand} {car.model} {car.variant}</p>
                        <Link to={`/cars/${car.slug}`} className="btn-outline w-full !py-1.5 text-xs mt-2">View Details</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-surface/50 dark:bg-white/[0.03]' : ''}>
                    <td className="p-3 text-xs font-semibold text-body uppercase tracking-wide align-top">{row.label}</td>
                    {cars.map((car) => (
                      <td key={car._id} className="p-3 text-sm text-ink dark:text-white/90 align-top">{row.render(car)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer settings={settings} />
    </div>
  );
}
