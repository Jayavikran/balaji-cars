import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, ChevronRight, Menu, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchSuggestions } from '@/api/cars';
import type { SiteSettings } from '@/types';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Cars', href: '/#car-listings' },
  { label: 'Contact', href: '/contact' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'km_low_high', label: 'Kilometers: Low to High' },
  { value: 'year_newest', label: 'Year: Newest' },
  { value: 'featured_first', label: 'Featured First' },
];

interface HeaderProps {
  settings?: SiteSettings;
  search?: string;
  onSearchChange?: (v: string) => void;
  sort?: string;
  onSortChange?: (v: string) => void;
  onOpenFilters?: () => void;
  showSearchBar?: boolean;
}

export default function Header({
  settings,
  search = '',
  onSearchChange,
  sort = 'newest',
  onSortChange,
  onOpenFilters,
  showSearchBar = true,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const companyName = settings?.companyName || 'BALAJI CARS';

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions', search],
    queryFn: () => fetchSearchSuggestions(search),
    enabled: !!showSearchBar && search.trim().length > 1,
  });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClickOutside);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const goLocation = () => {
    if (settings?.googleMapsLink) {
      window.open(settings.googleMapsLink, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate('/contact');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-white/10 ${
          isScrolled ? 'bg-black shadow-[0_6px_20px_rgba(0,0,0,.25)]' : 'bg-black'
        }`}
        style={{ background: '#000000', opacity: 1, backdropFilter: 'none' }}
      >
        <div className="premium-shell h-20 sm:h-24 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0 shrink-0">
            {settings?.companyLogo ? (
              <img
                src={settings.companyLogo}
                alt={companyName}
                className="h-12 w-auto object-contain drop-shadow-[0_8px_24px_rgba(244,180,0,.12)]"
                loading="eager"
              />
            ) : (
              <div className="flex flex-col leading-none">
                <span className="text-[1.45rem] sm:text-[1.7rem] font-extrabold tracking-[0.18em] text-white">
                  BALAJI <span className="text-[#F4B400]">CARS</span>
                </span>
                <span className="mt-1 text-[0.67rem] sm:text-[0.72rem] tracking-[0.45em] text-white/80">TIRUNELVELI</span>
              </div>
            )}
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-10 flex-1">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === '/'
                  ? activePath === '/'
                  : activePath === item.href || (item.href === '/#car-listings' && activePath === '/');
              return (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={`relative py-2 text-base font-semibold transition-colors ${
                    isActive ? 'text-[#F4B400]' : 'text-white hover:text-white/90'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-1 h-0.5 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-[#F4B400]' : 'bg-transparent'
                    }`}
                  />
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {showSearchBar && (
          <div className="border-t border-white/10 bg-white">
            <div className="premium-shell py-1 sm:py-2">
              <div className="glass-card px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                  <div ref={searchRef} className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                      value={search}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      type="text"
                      placeholder="Search by Brand, Model, Variant, Registration Number or Year..."
                      className="w-full h-14 rounded-2xl border border-line bg-white pl-11 pr-4 text-sm font-medium text-ink placeholder:text-body/70 outline-none transition-all focus:border-[#F4B400] focus:shadow-[0_0_0_4px_rgba(244,180,0,.1)]"
                    />

                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-cardHover"
                        >
                          {suggestions.map((item) => (
                            <button
                              key={item.slug}
                              type="button"
                              onClick={() => {
                                navigate(`/cars/${item.slug}`);
                                setShowSuggestions(false);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-surface"
                            >
                              <Search size={14} className="text-body" />
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-0 lg:pb-0 scrollbar-hide">
                    <div ref={sortRef} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setSortOpen((v) => !v)}
                        className="premium-chip whitespace-nowrap"
                      >
                        <ArrowUpDown size={16} />
                        <span>Sort</span>
                      </button>
                      <AnimatePresence>
                        {sortOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-cardHover"
                          >
                            {SORT_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  onSortChange?.(option.value);
                                  setSortOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-surface ${
                                  sort === option.value ? 'font-semibold text-[#F4B400]' : 'text-ink'
                                }`}
                              >
                                {option.label}
                                {sort === option.value && <ChevronRight size={14} />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenFilters}
                      className="premium-chip whitespace-nowrap"
                    >
                      <SlidersHorizontal size={16} />
                      <span>Filter</span>
                    </button>

                    <button
                      type="button"
                      onClick={goLocation}
                      className="premium-chip whitespace-nowrap"
                    >
                      <MapPin size={16} />
                      <span>Location</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setDrawerOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="mobile-nav-drawer absolute right-0 top-0 h-full w-full bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,.35)]"
            >
              <div className="flex h-full flex-col px-5 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col leading-none">
                    <span className="text-lg font-extrabold tracking-[0.18em] text-white">
                      BALAJI <span className="text-[#F4B400]">CARS</span>
                    </span>
                    <span className="mt-1 text-[0.62rem] tracking-[0.45em] text-white/70">TIRUNELVELI</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-8 space-y-2">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold transition-colors hover:bg-white/10"
                    >
                      {item.label}
                      <ChevronRight size={18} className="text-[#F4B400]" />
                    </Link>
                  ))}
                </div>

                {showSearchBar && (
                  <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Search inventory</p>
                    <input
                      value={search}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      type="text"
                      placeholder="Search by brand, model or year"
                      className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/50 outline-none"
                    />
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      <button type="button" onClick={onOpenFilters} className="premium-chip shrink-0 bg-white text-ink">
                        <SlidersHorizontal size={16} />
                        Filter
                      </button>
                      <button type="button" onClick={() => setSortOpen(false)} className="premium-chip shrink-0 bg-white text-ink">
                        <ArrowUpDown size={16} />
                        Sort
                      </button>
                      <button type="button" onClick={goLocation} className="premium-chip shrink-0 bg-white text-ink">
                        <MapPin size={16} />
                        Location
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-auto border-t border-white/10 pt-5 text-sm text-white/70">
                  <p className="font-semibold text-white">{companyName}</p>
                  <p className="mt-2">{settings?.address || 'Premium used car dealership'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
