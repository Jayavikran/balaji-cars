import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchCars, type CarFilters } from '@/api/cars';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroBanner from '@/components/public/HeroBanner';
import BrandFilter from '@/components/public/BrandFilter';
import FilterDrawer from '@/components/public/FilterDrawer';
import CarList from '@/components/public/CarList';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { advancedFiltersFromParams, paramsFromFilters } from '@/utils/filterParams';
import { Loader2, RefreshCw } from 'lucide-react';

type SortOption = 'newest' | 'price_low_high' | 'price_high_low' | 'km_low_high' | 'year_newest' | 'featured_first';

const PAGE_SIZE = 12;
const DEBOUNCE_DELAY = 300;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── State ────────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));
  const [appliedFilters, setAppliedFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));

  const { data: settings } = useSiteSettings();

  // ─── Debounced Search ──────────────────────────────────────────────────────
  const [debouncedSearch] = useDebounce(search, DEBOUNCE_DELAY);

  // ─── SEO ──────────────────────────────────────────────────────────────────
  const siteName = settings?.companyName || 'BALAJI CARS';
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const seoTitle = `${siteName} | Premium Certified Used Cars`;
  const seoDescription = `Browse ${siteName}'s certified used car inventory. Compare vehicles, calculate EMI, and connect with our dealership over WhatsApp or phone - every listing verified.`;

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

  // ─── Filters ──────────────────────────────────────────────────────────────
  const combinedFilters: CarFilters = useMemo(
    () => ({
      ...appliedFilters,
      q: debouncedSearch || undefined,
      brand: brand !== 'All' ? brand : appliedFilters.brand,
      sort,
      availableOnly: true,
      page,
      pageSize: PAGE_SIZE,
    }),
    [appliedFilters, debouncedSearch, brand, sort, page]
  );

  // ─── React Query ───────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['cars', combinedFilters],
    queryFn: () => fetchCars(combinedFilters),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // ─── URL Sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const params = paramsFromFilters({
      q: search,
      sort,
      brand,
      advanced: appliedFilters,
    });
    setSearchParams(params, { replace: true });
  }, [search, sort, brand, appliedFilters, setSearchParams]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage((p) => p + 1);
    }
  }, [data?.pagination, page]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleBrandSelect = useCallback((b: string) => {
    setBrand(b);
    setPage(1);
  }, []);

  const handleApplyFilters = useCallback((filters: CarFilters) => {
    setAppliedFilters(filters);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setDraftFilters({});
    setAppliedFilters({});
    setPage(1);
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const totalCount = data?.pagination?.total || 0;
  const hasMore = data?.pagination ? page < data.pagination.totalPages : false;
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isFetching && !isLoading;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="mobile-page min-h-screen flex flex-col">
      <Seo title={seoTitle} description={seoDescription} jsonLd={autoDealerJsonLd} />

      <Header
        settings={settings}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={handleSortChange}
        onOpenFilters={() => setDrawerOpen(true)}
        showSearchBar
      />

      <HeroBanner />

      <BrandFilter active={brand} onSelect={handleBrandSelect} />

      <section id="car-listings" className="scroll-mt-28 flex-1 py-6 sm:py-10 lg:py-14">
        <div className="premium-shell">
          {/* ─── Header ──────────────────────────────────────────────────── */}
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 lg:mb-8">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[1.55rem] font-extrabold leading-tight text-ink sm:text-[2.2rem]">
                  {search ? `Results for "${search}"` : brand !== 'All' ? `${brand} Cars` : 'Available Cars'}
                </h2>
                <p className="mt-1 text-xs text-body sm:text-sm">Only verified available cars are shown here.</p>
              </div>
              {isRefreshing && (
                <Loader2 size={18} className="animate-spin text-[#F4B400]" aria-label="Updating results" />
              )}
            </div>
            {totalCount > 0 && (
              <div className="text-xs font-medium text-body sm:text-sm">
                {totalCount} vehicle{totalCount > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* ─── Error State ────────────────────────────────────────────── */}
          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-950/20 p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">
                Failed to load cars. Please try again.
              </p>
              {error && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                  {error.message || 'An unexpected error occurred.'}
                </p>
              )}
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:scale-105 active:scale-95"
              >
                <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
                Retry
              </button>
            </div>
          )}

          {/* ─── Car List ────────────────────────────────────────────────── */}
          {!isError && (
            <CarList
              cars={data?.cars || []}
              isLoading={isInitialLoading}
              isFetching={isRefreshing}
              totalCount={totalCount}
              loadMore={loadMore}
              hasMore={hasMore}
            />
          )}
        </div>
      </section>

      <Footer settings={settings} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}