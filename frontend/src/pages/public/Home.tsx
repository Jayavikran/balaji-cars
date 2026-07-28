import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, CarFront, Handshake, Loader2, Users } from 'lucide-react';
import { fetchCars, type CarFilters } from '@/api/cars';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroBanner from '@/components/public/HeroBanner';
import BrandFilter from '@/components/public/BrandFilter';
import FilterDrawer from '@/components/public/FilterDrawer';
import CarCard from '@/components/public/CarCard';
import CardSkeleton from '@/components/public/CardSkeleton';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { advancedFiltersFromParams, paramsFromFilters } from '@/utils/filterParams';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));
  const [appliedFilters, setAppliedFilters] = useState<CarFilters>(() => advancedFiltersFromParams(searchParams));

  const { data: settings } = useSiteSettings();

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

  const combinedFilters: CarFilters = useMemo(
    () => ({
      ...appliedFilters,
      q: search || undefined,
      brand: brand !== 'All' ? brand : appliedFilters.brand,
      sort,
      page,
      pageSize: 12,
      availableOnly: true,
    }),
    [appliedFilters, search, brand, sort, page]
  );

  useEffect(() => {
    const params = paramsFromFilters({ q: search, sort, brand, page, advanced: appliedFilters });
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, brand, page, appliedFilters]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cars', combinedFilters],
    queryFn: () => fetchCars(combinedFilters),
    placeholderData: keepPreviousData,
  });

  const showBackgroundSpinner = isFetching && !isLoading;
  const orderedCars = useMemo(() => {
    if (!data?.cars.length) return [];
    const firstFeatured = data.cars.find((car) => car.isFeatured);
    if (!firstFeatured) return data.cars;
    return [firstFeatured, ...data.cars.filter((car) => car._id !== firstFeatured._id)];
  }, [data]);

  const resultsHeading = () => {
    if (search) return `Results for "${search}"`;
    if (brand !== 'All') return `${brand} Cars`;
    return 'Available Cars';
  };

  return (
    <div className="mobile-page min-h-screen flex flex-col">
      <Seo title={seoTitle} description={seoDescription} jsonLd={autoDealerJsonLd} />
      <Header
        settings={settings}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(v) => {
          setSort(v);
          setPage(1);
        }}
        onOpenFilters={() => setDrawerOpen(true)}
        showSearchBar
      />

      <HeroBanner />

      <section className="relative z-20 -mt-8 sm:-mt-12">
        <div className="premium-shell">
          <div className="glass-card grid grid-cols-2 gap-0 overflow-hidden lg:grid-cols-4">
            {[
              { value: '500+', label: 'Cars Available', icon: CarFront },
              { value: '1000+', label: 'Happy Customers', icon: Users },
              { value: '100%', label: 'Verified Cars', icon: BadgeCheck },
              { value: 'Easy', label: 'Loan Facility', icon: Handshake },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 border-r border-line/70 dark:border-white/10 last:border-r-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                  <Icon size={24} />
                </div>
                <div>
                  <strong className="block text-xl font-extrabold leading-none text-[#F4B400] sm:text-3xl">{value}</strong>
                  <span className="mt-1 block text-xs font-medium text-body dark:text-white/70 sm:text-sm">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandFilter active={brand} onSelect={(b) => {
        setBrand(b);
        setPage(1);
      }} />

      <section id="car-listings" className="mobile-listings scroll-mt-28 flex-1 py-6 sm:py-10 lg:py-14">
        <div className="premium-shell">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 lg:mb-8">
            <div className="flex items-end gap-2 sm:gap-3">
              <div>
                <h2 className="text-[1.55rem] font-extrabold leading-tight text-ink sm:text-[2.2rem]">
                  {resultsHeading()}
                </h2>
                <p className="mt-1 text-xs text-body sm:text-sm">Only verified available cars are shown here.</p>
              </div>
              {showBackgroundSpinner && <Loader2 size={16} className="mb-2 animate-spin text-[#F4B400]" aria-label="Updating results" />}
            </div>
            <div className="text-xs font-medium text-body sm:text-sm">
              {data ? `${data.pagination.total} vehicles` : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.cars.length > 0 ? (
            <>
              <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6 transition-opacity duration-200 ${showBackgroundSpinner ? 'opacity-60' : 'opacity-100'}`}>
                {orderedCars.map((car, index) => (
                  <CarCard key={car._id} car={car} badge={index === 0 && car.isFeatured ? 'Featured' : undefined} />
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2 lg:mt-14">
                  {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i + 1)}
                      className={`h-10 w-10 rounded-full text-sm font-semibold transition-all ${
                        page === i + 1 ? 'bg-[#F4B400] text-black shadow-card' : 'bg-white text-ink shadow-sm hover:bg-surface'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[22px] border border-dashed border-line bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-body">No cars matched your search. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
        onReset={() => {
          setDraftFilters({});
          setAppliedFilters({});
          setPage(1);
        }}
      />
    </div>
  );
}
