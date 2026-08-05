import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { X, ShieldCheck, ArrowLeft, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useCompare, type CompareCar } from '@/hooks/useCompare';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Seo from '@/components/shared/Seo';
import { fetchCarByIdOrSlug } from '@/api/cars';
import { optimizeImage } from '@/utils/optimizeImage';
import type { Car } from '@/types';
import { memo, useState, useEffect } from 'react';

// ─── HELPERS ────────────────────────────────────────────────────────────────
function formatPrice(price?: number) {
  if (price === undefined) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Crore`;
  return `₹${(price / 100000).toFixed(2)} Lakh`;
}

// ─── ROWS CONFIGURATION ───────────────────────────────────────────────────
const ROWS: { label: string; render: (car: Car) => React.ReactNode }[] = [
  { 
    label: 'Price', 
    render: (c) => <span className="price-tag text-base font-semibold text-[#F4B400]">{formatPrice(c.price)}</span> 
  },
  { 
    label: 'Mileage', 
    render: (c) => c.mileage ? `${c.mileage} km/l` : '—' 
  },
  { 
    label: 'Fuel Type', 
    render: (c) => c.fuelType || '—' 
  },
  { 
    label: 'Transmission', 
    render: (c) => c.transmission || '—' 
  },
  { 
    label: 'Engine', 
    render: (c) => c.engineCC ? `${c.engineCC} cc` : '—' 
  },
  { 
    label: 'Power', 
    render: (c) => c.power ? `${c.power} bhp` : '—' 
  },
  { 
    label: 'Seats', 
    render: (c) => c.seats ?? '—' 
  },
  { 
    label: 'Owner', 
    render: (c) => c.owner || '—' 
  },
  { 
    label: 'Kilometers Driven', 
    render: (c) => c.kilometersDriven ? `${c.kilometersDriven.toLocaleString('en-IN')} km` : '—' 
  },
  { 
    label: 'Registration Year', 
    render: (c) => c.registrationYear || '—' 
  },
  { 
    label: 'Insurance', 
    render: (c) => c.insuranceActive
      ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck size={14} className="text-emerald-500" aria-hidden="true" /> Active
        </span>
      : <span className="text-body">Expired</span>
  },
  { 
    label: 'Features', 
    render: (c) => (
      <div className="flex flex-wrap gap-1.5">
        {c.features?.length ? c.features.slice(0, 6).map((f) => (
          <span 
            key={f} 
            className="inline-block px-2 py-0.5 bg-surface dark:bg-white/5 text-ink dark:text-white/80 text-[10px] rounded-full border border-line dark:border-white/10"
          >
            {f}
          </span>
        )) : <span className="text-body">—</span>}
        {c.features?.length > 6 && (
          <span className="inline-block px-2 py-0.5 text-[10px] text-body">
            +{c.features.length - 6} more
          </span>
        )}
      </div>
    ),
  },
  { 
    label: 'Description', 
    render: (c) => (
      <p className="text-xs leading-relaxed text-body max-w-[200px] line-clamp-3">
        {c.description || '—'}
      </p>
    )
  },
];

// ─── CAR HEADER ────────────────────────────────────────────────────────────
const CarHeader = memo(function CarHeader({ 
  car, 
  onRemove 
}: { 
  car: Car; 
  onRemove: (id: string) => void;
}) {
  const imageUrl = car.images?.[0]?.url 
    ? optimizeImage(car.images[0].url, 400) 
    : '/images/placeholder-car.jpg';

  return (
    <div className="relative surface-card rounded-card p-3 bg-white dark:bg-white/5 border border-line dark:border-white/10">
      <button
        onClick={() => onRemove(car._id)}
        aria-label={`Remove ${car.brand} ${car.model} from comparison`}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-black/60 text-ink dark:text-white flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
      >
        <X size={14} aria-hidden="true" />
      </button>
      
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-surface dark:bg-white/5">
        <img 
          src={imageUrl}
          alt={`${car.brand} ${car.model} ${car.variant}`}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
      
      <p className="font-display font-semibold text-sm text-ink dark:text-white truncate mt-2">
        {car.brand} {car.model} {car.variant}
      </p>
      
      <div className="flex items-center gap-2 mt-2">
        <Link 
          to={`/cars/${car.slug}`} 
          className="flex-1 inline-flex items-center justify-center rounded-full bg-[#F4B400]/10 text-[#F4B400] hover:bg-[#F4B400] hover:text-black transition-all px-3 py-1.5 text-xs font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
});

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────
export default function Compare() {
  const { compareList: hookList, removeFromCompare: hookRemove, clearCompare: hookClear } = useCompare();
  const { data: settings } = useSiteSettings();

  const [localList, setLocalList] = useState<CompareCar[]>(() => {
    try {
      const stored = localStorage.getItem('balaji-cars-compare');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (hookList.length > 0) {
      setLocalList(hookList);
    }
  }, [hookList]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('balaji-cars-compare');
        const parsed = stored ? JSON.parse(stored) : [];
        setLocalList(parsed);
      } catch {
        setLocalList([]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('compare-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('compare-changed', handleStorageChange);
    };
  }, []);

  const compareList = hookList.length > 0 ? hookList : localList;

  const removeFromCompare = (id: string) => {
    hookRemove(id);
    const updated = localList.filter((c) => c._id !== id);
    setLocalList(updated);
  };

  const clearCompare = () => {
    hookClear();
    setLocalList([]);
  };

  const results = useQueries({
    queries: compareList.map((c) => ({
      queryKey: ['car', c._id],
      queryFn: () => fetchCarByIdOrSlug(c._id),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    })),
  });

  const cars = results.map((r) => r.data).filter((c): c is Car => Boolean(c));
  const isLoading = results.some((r) => r.isLoading);
  const isFetching = results.some((r) => r.isFetching);
  const isError = results.some((r) => r.isError);
  const isAtMax = compareList.length >= 3;
  const allLoaded = !isLoading && !isError && cars.length === compareList.length;

  const refetchAll = () => {
    results.forEach((r) => r.refetch());
  };

  if (isLoading && compareList.length > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Seo
          title={`Compare Cars | ${settings?.companyName || 'BALAJI CARS'}`}
          description="Compare vehicle specs, pricing, and features side by side."
          noindex
        />
        <Header settings={settings} showSearchBar={false} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-body hover:text-ink dark:hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to listings
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2">Compare Cars</h1>
          <p className="text-body text-sm mb-6">Compare up to 3 vehicles side by side to find your perfect match</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareList.map((c) => (
              <div key={c._id} className="rounded-card bg-surface dark:bg-white/5 h-[400px] animate-pulse border border-line dark:border-white/10" />
            ))}
          </div>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Seo
          title={`Compare Cars | ${settings?.companyName || 'BALAJI CARS'}`}
          description="Compare vehicle specs, pricing, and features side by side."
          noindex
        />
        <Header settings={settings} showSearchBar={false} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-body hover:text-ink dark:hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to listings
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2">Compare Cars</h1>
          <p className="text-body text-sm mb-6">Compare up to 3 vehicles side by side to find your perfect match</p>
          <div className="text-center py-16 px-4 border border-red-200 dark:border-red-800/30 rounded-card bg-red-50 dark:bg-red-950/20">
            <p className="text-red-600 dark:text-red-400 font-medium">Something went wrong loading car details</p>
            <p className="text-sm text-red-500 dark:text-red-300 mt-1">Please try again or remove some cars from comparison.</p>
            <div className="mt-4 flex gap-3 justify-center">
              <button onClick={refetchAll} className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-red-700 transition-all">
                <RefreshCw size={16} className="transition-transform hover:rotate-180" />
                Retry
              </button>
              <button onClick={clearCompare} className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                Clear all
              </button>
            </div>
          </div>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Seo
          title={`Compare Cars | ${settings?.companyName || 'BALAJI CARS'}`}
          description="Compare vehicle specs, pricing, and features side by side."
          noindex
        />
        <Header settings={settings} showSearchBar={false} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-body hover:text-ink dark:hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to listings
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2">Compare Cars</h1>
          <p className="text-body text-sm mb-6">Compare up to 3 vehicles side by side to find your perfect match</p>
          <div className="text-center py-16 px-4 border border-dashed border-line dark:border-white/10 rounded-card bg-surface/30 dark:bg-white/5">
            <p className="text-body">No cars selected for comparison.</p>
            <p className="text-sm text-body/60 mt-1">Add up to 3 cars to compare from any car card.</p>
            <Link to="/" className="inline-flex items-center gap-2 mt-4 bg-[#F4B400] text-black px-6 py-2.5 rounded-full font-semibold hover:bg-[#f7c233] transition-all hover:scale-[1.02]">
              Browse Cars
            </Link>
          </div>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Seo
        title={`Compare Cars | ${settings?.companyName || 'BALAJI CARS'}`}
        description="Compare vehicle specs, pricing, and features side by side."
        noindex
      />
      <Header settings={settings} showSearchBar={false} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-body hover:text-ink dark:hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to listings
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-1">
              Compare Cars
            </h1>
            <p className="text-body text-sm">
              Compare {compareList.length} vehicle{compareList.length > 1 ? 's' : ''} side by side
            </p>
          </div>
          {isFetching && (
            <Loader2 size={20} className="animate-spin text-[#F4B400]" aria-label="Refreshing..." />
          )}
        </div>

        {isAtMax && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-xl text-sm text-yellow-800 dark:text-yellow-300">
            <AlertTriangle size={18} className="flex-shrink-0" aria-hidden="true" />
            <span>
              <span className="font-medium">Maximum 3 cars can be compared.</span> 
              {' '}Remove a car to add another vehicle.
            </span>
          </div>
        )}

        {!allLoaded && !isLoading && !isError && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl text-sm text-blue-700 dark:text-blue-300">
            Loading car details...
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-card border border-line dark:border-white/10 bg-white dark:bg-black">
          <table className="w-full border-collapse min-w-[640px]">
            <thead className="bg-surface dark:bg-white/5">
              <tr>
                <th scope="col" className="w-40 p-4 text-left text-xs font-semibold text-body uppercase tracking-wider">
                  Specs
                </th>
                {cars.map((car) => (
                  <th scope="col" key={car._id} className="p-4 min-w-[200px] align-top">
                    <CarHeader car={car} onRemove={removeFromCompare} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => (
                <tr 
                  key={row.label} 
                  className={`${index % 2 === 0 ? 'bg-surface/30 dark:bg-white/[0.03]' : ''} hover:bg-surface/50 dark:hover:bg-white/[0.06] transition-colors`}
                >
                  <td className="p-4 text-xs font-semibold text-body uppercase tracking-wide align-top sticky left-0 bg-inherit">
                    {row.label}
                  </td>
                  {cars.map((car) => (
                    <td key={car._id} className="p-4 text-sm text-ink dark:text-white/90 align-top">
                      {row.render(car)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-body hover:text-ink dark:hover:text-white transition-colors">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to listings
          </Link>
          <div className="flex gap-3">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
              >
                Clear all ({compareList.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer settings={settings} />
    </div>
  );
}