import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, CarFront, Handshake, Users, Loader2 } from 'lucide-react';
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

      <section className="hidden lg:block relative z-20 max-w-[1400px] mx-auto -mt-10 px-6">
        <div className="h-[108px] rounded-3xl bg-white dark:bg-[#111a2c] shadow-2xl border border-line/70 dark:border-white/10 flex items-center justify-around">
          {[
            { value: '500+', label: 'Cars Available', icon: CarFront },
            { value: '1000+', label: 'Happy Customers', icon: Users },
            { value: '100%', label: 'Verified Cars', icon: BadgeCheck },
            { value: 'Easy', label: 'Loan Facility', icon: Handshake },
          ].map(({ value, label, icon: Icon }, index) => (
            <div key={label} className="flex items-center gap-4 px-8 flex-1 justify-center border-r border-line dark:border-white/10 last:border-r-0">
              <span className="w-14 h-14 rounded-full bg-emerald/10 text-emerald flex items-center justify-center"><Icon size={25} /></span>
              <span><strong className="block font-display text-2xl leading-none text-emerald">{value}</strong><span className="block mt-1.5 text-sm font-medium text-body dark:text-white/70">{label}</span></span>
            </div>
          ))}
        </div>
      </section>

      <BrandFilter active={brand} onSelect={(b) => { setBrand(b); setPage(1); }} />

      {featured.length > 0 && (
        <section className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-4 lg:pt-[60px] lg:pb-[60px]">
          <h2 className="font-display text-[22px] lg:text-[32px] font-bold text-ink dark:text-white mb-4 lg:mb-6">Featured Cars</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
            {featured.slice(0, 4).map((car) => <CarCard key={car._id} car={car} />)}
          </div>
        </section>
      )}

      <section id="car-listings" className="scroll-mt-24 sm:scroll-mt-20 max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-[60px] flex-1">
        <div className="flex items-center justify-between mb-5 lg:mb-8 flex-wrap gap-3 lg:flex-nowrap lg:gap-4 lg:bg-surface/60 dark:lg:bg-white/5 lg:rounded-2xl lg:px-5 lg:py-3.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display text-[22px] lg:text-[32px] font-bold text-ink dark:text-white">{resultsHeading()}</h2>
            {showBackgroundSpinner && <Loader2 size={16} className="animate-spin text-navy dark:text-emerald" aria-label="Updating results" />}
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            {data && <span className="text-sm text-body whitespace-nowrap">{data.pagination.total} vehicles</span>}
            <StatusTabs active={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : data && data.cars.length > 0 ? (
          <>
            <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8 transition-opacity duration-200 ${showBackgroundSpinner ? 'opacity-60' : 'opacity-100'}`}>
              {data.cars.map((car) => <CarCard key={car._id} car={car} />)}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10 lg:mt-14">
                {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full text-sm font-medium transition-colors ${
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
