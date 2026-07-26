import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchCars, type CarFilters } from '@/api/cars';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroBanner from '@/components/public/HeroBanner';
import BrandFilter from '@/components/public/BrandFilter';
import StatusTabs from '@/components/public/StatusTabs';
import FilterDrawer from '@/components/public/FilterDrawer';
import FloatingContacts from '@/components/public/FloatingContacts';
import CarCard from '@/components/public/CarCard';
import CardSkeleton from '@/components/public/CardSkeleton';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { advancedFiltersFromParams, paramsFromFilters } from '@/utils/filterParams';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Every filter initializes FROM the URL on first render, so a refresh
  // (or a shared/bookmarked link) restores exactly what was selected.
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [status, setStatus] = useState<CarFilters['status'] | undefined>(
    (searchParams.get('status') as CarFilters['status'] | null) || undefined
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));
  const [appliedFilters, setAppliedFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));

  const { data: settings } = useSiteSettings();

  const siteName = settings?.companyName || 'BALAJI CARS';
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const seoTitle = `${siteName} | Premium Certified Used Cars`;
  const seoDescription = `Browse ${siteName}'s certified used car inventory. Compare vehicles, calculate EMI, and connect with our dealership over WhatsApp or phone — every listing verified.`;

  const autoDealerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: siteName,
    url: siteOrigin,
    telephone: settings?.phoneNumber,
    email: settings?.email,
    address: settings?.address ? { '@type': 'PostalAddress', streetAddress: settings.address } : undefined,
    sameAs: [settings?.facebookUrl, settings?.instagramUrl, settings?.youtubeUrl].filter(Boolean),
  };

  const combinedFilters: CarFilters = useMemo(
    () => ({
      ...appliedFilters,
      q: search || undefined,
      brand: brand !== 'All' ? brand : appliedFilters.brand,
      status,
      sort,
      page,
      pageSize: 12,
    }),
    [appliedFilters, search, brand, status, sort, page]
  );

  // Keep the URL in sync with every filter so state survives a refresh and
  // is shareable. Uses `replace` so typing in the search box doesn't spam
  // the browser history stack.
  useEffect(() => {
    const params = paramsFromFilters({ q: search, sort, brand, status, page, advanced: appliedFilters });
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, brand, status, page, appliedFilters]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cars', combinedFilters],
    queryFn: () => fetchCars(combinedFilters),
    placeholderData: keepPreviousData,
  });

  const featured = useMemo(() => data?.cars.filter((c) => c.isFeatured) ?? [], [data]);
  const showBackgroundSpinner = isFetching && !isLoading;

  const resultsHeading = () => {
    if (search) return `Results for "${search}"`;
    if (status) return `${status} Cars`;
    return 'Available Cars';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo title={seoTitle} description={seoDescription} jsonLd={autoDealerJsonLd} />
      <Header
        settings={settings}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        sort={sort}
        onSortChange={(v) => { setSort(v); setPage(1); }}
        onOpenFilters={() => setDrawerOpen(true)}
      />

      <HeroBanner />

      <BrandFilter active={brand} onSelect={(b) => { setBrand(b); setPage(1); }} />

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white mb-4">Featured Cars</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {featured.slice(0, 4).map((car) => <CarCard key={car._id} car={car} />)}
          </div>
        </section>
      )}

      <section id="car-listings" className="scroll-mt-24 sm:scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">{resultsHeading()}</h2>
            {showBackgroundSpinner && <Loader2 size={16} className="animate-spin text-navy dark:text-emerald" aria-label="Updating results" />}
          </div>
          <div className="flex items-center gap-3">
            {data && <span className="text-sm text-body">{data.pagination.total} vehicles</span>}
            <StatusTabs active={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : data && data.cars.length > 0 ? (
          <>
            <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 transition-opacity duration-200 ${showBackgroundSpinner ? 'opacity-60' : 'opacity-100'}`}>
              {data.cars.map((car) => <CarCard key={car._id} car={car} />)}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                      page === i + 1 ? 'bg-navy text-white dark:bg-emerald' : 'bg-surface dark:bg-white/5 text-ink dark:text-white/80 hover:bg-line dark:hover:bg-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-line dark:border-white/10 rounded-card">
            <p className="text-body">No cars matched your search. Try adjusting your filters.</p>
          </div>
        )}
      </section>

      <Footer settings={settings} />
      <FloatingContacts settings={settings} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => { setAppliedFilters(draftFilters); setPage(1); }}
        onReset={() => { setDraftFilters({}); setAppliedFilters({}); setPage(1); }}
      />
    </div>
  );
}
