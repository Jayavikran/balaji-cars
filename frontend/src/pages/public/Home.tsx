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
import { buildDealerSchema, buildWebsiteSchema, getSiteOrigin, SITE_NAME, DEFAULT_CITY } from '@/utils/seo';
import { Loader2, RefreshCw } from 'lucide-react';

type SortOption = 'newest' | 'price_low_high' | 'price_high_low' | 'km_low_high' | 'year_newest' | 'featured_first';

const PAGE_SIZE = 12;
const DEBOUNCE_DELAY = 300;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));
  const [appliedFilters, setAppliedFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));

  const { data: settings } = useSiteSettings();

  const [debouncedSearch] = useDebounce(search, DEBOUNCE_DELAY);

  const siteName = settings?.companyName || SITE_NAME;
  const siteOrigin = getSiteOrigin();
  const seoTitle = `Used Cars in ${DEFAULT_CITY}`;
  const seoDescription = `Find verified used cars in ${DEFAULT_CITY} with BALAJI CARS. Browse second-hand cars, compare listings, calculate EMI, and contact us for buying or selling support.`;
  const hasQueryParams = searchParams.toString().length > 0;
  const homepageSchemas = [
    buildWebsiteSchema(siteOrigin, siteName),
    buildDealerSchema(settings, siteOrigin, siteName),
  ];

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

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['cars', combinedFilters],
    queryFn: () => fetchCars(combinedFilters),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  useEffect(() => {
    const params = paramsFromFilters({
      q: debouncedSearch,
      sort,
      brand,
      advanced: appliedFilters,
    });
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, sort, brand, appliedFilters, setSearchParams]);

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

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setPage(1);
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters({});
    setAppliedFilters({});
    setPage(1);
  }, []);

  const totalCount = data?.pagination?.total || 0;
  const hasMore = data?.pagination ? page < data.pagination.totalPages : false;
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isFetching && !isLoading;

  return (
    <div className="mobile-page min-h-screen flex flex-col">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical="/"
        noindex={hasQueryParams}
        jsonLd={homepageSchemas}
        openGraph={{
          title: `${seoTitle} | ${siteName}`,
          description: seoDescription,
          images: [{ url: '/images/banner1.jpeg', alt: `${siteName} showroom in ${DEFAULT_CITY}` }],
        }}
      />

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

      <section id="car-listings" className="scroll-mt-28 flex-1 py-4 sm:py-6 lg:py-10">
        <div className="premium-shell">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 lg:mb-8">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-[1.55rem] font-extrabold leading-tight text-ink sm:text-[2.2rem]">
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

          {!isError && (
            <CarList
              cars={data?.cars || []}
              isLoading={isInitialLoading}
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
