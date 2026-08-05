import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ArrowUpDown, 
  ChevronRight, 
  Menu, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchSearchSuggestions } from '@/api/cars';
import type { SiteSettings } from '@/types';

type SortOption = 'newest' | 'price_low_high' | 'price_high_low' | 'km_low_high' | 'year_newest' | 'featured_first';

interface HeaderProps {
  settings?: SiteSettings;
  search?: string;
  onSearchChange?: (value: string) => void;
  sort?: SortOption;
  onSortChange?: (value: SortOption) => void;
  onOpenFilters?: () => void;
  showSearchBar?: boolean;
}

interface SuggestionItem {
  slug: string;
  label: string;
  category?: string;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Cars', href: '/#car-listings' },
  { label: 'Contact', href: '/contact' },
] as const;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'km_low_high', label: 'Kilometers: Low to High' },
  { value: 'year_newest', label: 'Year: Newest' },
  { value: 'featured_first', label: 'Featured First' },
];

const useKeyboardShortcuts = ({
  onSearchFocus,
  onEscape,
}: {
  onSearchFocus?: () => void;
  onEscape?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearchFocus?.();
      }
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchFocus, onEscape]);
};

const useClickOutside = (refs: React.RefObject<HTMLElement>[], onOutsideClick: () => void) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutside = refs.every(ref => 
        ref.current && !ref.current.contains(e.target as Node)
      );
      if (isOutside) {
        onOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, onOutsideClick]);
};

const SuggestionsSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-line bg-white shadow-cardHover p-4"
  >
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="flex-1 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </motion.div>
);

const SuggestionItem = ({ 
  item, 
  onClick 
}: { 
  item: SuggestionItem; 
  onClick: () => void;
}) => (
  <motion.button
    type="button"
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-surface focus:bg-surface focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
    role="option"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <Search size={14} className="text-body/50 flex-shrink-0" aria-hidden="true" />
    <span>{item.label}</span>
    {item.category && (
      <span className="ml-auto text-xs text-body/40">{item.category}</span>
    )}
  </motion.button>
);

const SortDropdown = ({
  sort,
  onSortChange,
  isOpen,
  setIsOpen,
}: {
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useClickOutside([ref], () => setIsOpen(false));

  return (
    <div ref={ref} className="relative shrink-0">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Sort cars"
        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-all hover:border-[#F4B400]/30 hover:bg-[#F4B400]/5 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 whitespace-nowrap sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"
      >
        <ArrowUpDown size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Sort</span>
        {sort && (
          <span className="hidden sm:inline text-[#F4B400] font-semibold">
            {SORT_OPTIONS.find(opt => opt.value === sort)?.label.split(':')[0]}
          </span>
        )}
      </motion.button>
      
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: 99999,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '8px',
            minWidth: '240px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}
          className="overflow-hidden"
          role="listbox"
          aria-label="Sort options"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSortChange?.(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                sort === option.value ? 'font-semibold text-[#F4B400]' : 'text-ink'
              }`}
              role="option"
              aria-selected={sort === option.value}
            >
              {option.label}
              {sort === option.value && (
                <span className="text-[#F4B400]">
                  <Check size={16} aria-hidden="true" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const companyName = settings?.companyName || 'BALAJI CARS';
  
  const [debouncedSearch] = useDebounce(search, 300);

  const { 
    data: suggestions = [], 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['suggestions', debouncedSearch],
    queryFn: () => fetchSearchSuggestions(debouncedSearch),
    enabled: showSearchBar && debouncedSearch.trim().length > 1,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const goLocation = useCallback(() => {
    if (settings?.googleMapsLink) {
      window.open(settings.googleMapsLink, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate('/contact');
  }, [settings?.googleMapsLink, navigate]);

  const handleSearchFocus = useCallback(() => {
    setShowSuggestions(true);
    setFocusedIndex(-1);
    const announcer = document.getElementById('search-announcer');
    if (announcer) {
      announcer.textContent = 'Search suggestions available';
    }
  }, []);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  const handleSuggestionClick = useCallback((slug: string) => {
    navigate(`/cars/${slug}`);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    if (onSearchChange) {
      onSearchChange('');
    }
  }, [navigate, onSearchChange]);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
    document.body.style.overflow = drawerOpen ? '' : 'hidden';
  }, [drawerOpen]);

  const handleSortSelect = useCallback((value: SortOption) => {
    onSortChange?.(value);
    setSortOpen(false);
  }, [onSortChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[focusedIndex].slug);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, focusedIndex, handleSuggestionClick]);

  useEffect(() => {
    if (focusedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[role="option"]');
      if (items[focusedIndex]) {
        items[focusedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  useKeyboardShortcuts({
    onSearchFocus: () => searchInputRef.current?.focus(),
    onEscape: () => {
      setShowSuggestions(false);
      setSortOpen(false);
      setDrawerOpen(false);
    },
  });

  useEffect(() => {
    const onScroll = () => {
      setSortOpen(false);
      setShowSuggestions(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      setIsScrolled(scrolled);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <div id="search-announcer" className="sr-only" aria-live="polite"></div>

      <header
        className={`sticky top-0 z-50 border-b border-white/10 bg-black transition-all duration-300 ${
          isScrolled ? 'shadow-2xl shadow-black/50 backdrop-blur-sm bg-black/95' : ''
        }`}
        role="banner"
        aria-label="Main header"
      >
        <div className="container mx-auto px-4 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-2 shrink-0 group focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded-lg px-1 py-1"
            aria-label={`${companyName} - Go to homepage`}
          >
            {settings?.companyLogo ? (
              <motion.img
                src={settings.companyLogo}
                alt={companyName}
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                loading="eager"
                decoding="async"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            ) : (
              <div className="flex flex-col leading-none">
                <span className="text-base sm:text-xl lg:text-2xl font-extrabold tracking-[0.18em] text-white">
                  BALAJI <span className="text-[#F4B400]">CARS</span>
                </span>
                <span className="mt-0.5 text-[0.5rem] sm:text-[0.6rem] lg:text-[0.65rem] tracking-[0.45em] text-white/70">
                  TIRUNELVELI
                </span>
              </div>
            )}
          </Link>

          <nav 
            className="hidden md:flex items-center justify-center gap-8 lg:gap-10"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === '/'
                  ? activePath === '/'
                  : activePath === item.href || (item.href === '/#car-listings' && activePath === '/');
              
              return (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive: isNavActive }) => 
                    `relative py-2 text-sm lg:text-base font-semibold transition-all duration-200 ${
                      isNavActive || isActive ? 'text-[#F4B400]' : 'text-white/80 hover:text-white'
                    }`
                  }
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  <motion.span
                    className={`absolute left-0 right-0 -bottom-1 h-0.5 rounded-full ${
                      isActive ? 'bg-[#F4B400]' : 'bg-white/30'
                    }`}
                    initial={{ width: isActive ? '100%' : '0%' }}
                    animate={{ width: isActive ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </NavLink>
              );
            })}
          </nav>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleDrawer}
            aria-expanded={drawerOpen}
            aria-controls="mobile-menu"
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>

        {showSearchBar && (
          <div className="border-t border-white/10 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-2 sm:py-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div ref={searchRef} className="relative flex-1">
                  <Search 
                    size={16} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-body/60 pointer-events-none" 
                    aria-hidden="true"
                  />
                  
                  <motion.input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => {
                      onSearchChange?.(e.target.value);
                      if (e.target.value.trim().length > 1) {
                        setShowSuggestions(true);
                      }
                    }}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onKeyDown={handleKeyDown}
                    type="text"
                    placeholder="Search cars..."
                    className="w-full h-10 sm:h-12 rounded-xl border border-line bg-white pl-9 pr-3 text-sm font-medium text-ink placeholder:text-body/60 outline-none transition-all focus:border-[#F4B400] focus:shadow-[0_0_0_4px_rgba(244,180,0,.08)] focus:ring-1 focus:ring-[#F4B400]"
                    aria-label="Search cars"
                    aria-autocomplete="list"
                    aria-controls="suggestions-list"
                    aria-expanded={showSuggestions}
                    role="combobox"
                  />

                  <div id="suggestions-list" ref={suggestionsRef}>
                    <AnimatePresence mode="wait">
                      {showSuggestions && (
                        <>
                          {isLoading && <SuggestionsSkeleton />}
                          
                          {!isLoading && !isError && suggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.98 }}
                              transition={{ 
                                duration: 0.15, 
                                type: 'spring', 
                                stiffness: 300 
                              }}
                              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl max-h-80 overflow-y-auto"
                              role="listbox"
                              aria-label="Search suggestions"
                            >
                              {suggestions.map((item: SuggestionItem, index: number) => (
                                <SuggestionItem
                                  key={item.slug}
                                  item={item}
                                  onClick={() => handleSuggestionClick(item.slug)}
                                />
                              ))}
                            </motion.div>
                          )}

                          {!isLoading && !isError && suggestions.length === 0 && debouncedSearch.length > 1 && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl p-4 text-center text-sm text-body/60"
                            >
                              <Search size={24} className="mx-auto mb-2 text-body/30" aria-hidden="true" />
                              <p>No results found for "{debouncedSearch}"</p>
                              <p className="text-xs mt-1 text-body/40">Try adjusting your search terms</p>
                            </motion.div>
                          )}

                          {isError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-2xl p-4 text-center"
                            >
                              <p className="text-sm text-red-600">
                                Failed to load suggestions. 
                                <button 
                                  type="button"
                                  onClick={() => refetch()}
                                  className="ml-2 text-[#F4B400] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded px-2"
                                >
                                  Retry
                                </button>
                              </p>
                            </motion.div>
                          )}
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                  <SortDropdown
                    sort={sort}
                    onSortChange={handleSortSelect}
                    isOpen={sortOpen}
                    setIsOpen={setSortOpen}
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onOpenFilters}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-all hover:border-[#F4B400]/30 hover:bg-[#F4B400]/5 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 whitespace-nowrap sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Filter</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={goLocation}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-all hover:border-[#F4B400]/30 hover:bg-[#F4B400]/5 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 whitespace-nowrap sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"
                    aria-label="Find our location"
                  >
                    <MapPin size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Location</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <div 
            className="fixed inset-0 z-[60] md:hidden" 
            role="dialog" 
            aria-modal="true" 
            aria-label="Navigation menu"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={toggleDrawer}
              aria-hidden="true"
            />

            <motion.div
              id="mobile-menu"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl bg-gradient-to-b from-black to-[#0a0a0a] text-white shadow-2xl overflow-y-auto"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex h-full flex-col px-5 pt-5 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col leading-none">
                    <span className="text-lg font-extrabold tracking-[0.18em] text-white">
                      BALAJI <span className="text-[#F4B400]">CARS</span>
                    </span>
                    <span className="mt-0.5 text-[0.6rem] tracking-[0.45em] text-white/70">
                      TIRUNELVELI
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={toggleDrawer}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <nav className="mt-6 space-y-2" aria-label="Mobile navigation">
                  {NAV_LINKS.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.href}
                        onClick={toggleDrawer}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base font-semibold transition-all hover:bg-white/10 hover:border-[#F4B400]/30"
                      >
                        {item.label}
                        <ChevronRight size={18} className="text-[#F4B400]" aria-hidden="true" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {showSearchBar && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-[#F4B400]" />
                      <p className="text-sm font-semibold text-white">Sort & Filter</p>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Sort by</p>
                      {SORT_OPTIONS.map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                          onClick={() => {
                            handleSortSelect(option.value);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                            sort === option.value 
                              ? 'bg-[#F4B400]/20 text-[#F4B400] font-semibold' 
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {option.label}
                          {sort === option.value && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[#F4B400]"
                            >
                              <Check size={16} aria-hidden="true" />
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 mt-4">Search</p>
                    <input
                      value={search}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      type="text"
                      placeholder="Search by brand, model or year"
                      className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/50 outline-none transition-all focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/30"
                      aria-label="Search cars in mobile menu"
                    />
                    
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button" 
                        onClick={() => {
                          onOpenFilters?.();
                          toggleDrawer();
                        }} 
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/20 whitespace-nowrap flex-1"
                      >
                        <SlidersHorizontal size={14} aria-hidden="true" />
                        Filter
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button" 
                        onClick={() => {
                          goLocation();
                          toggleDrawer();
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/20 whitespace-nowrap flex-1"
                      >
                        <MapPin size={14} aria-hidden="true" />
                        Location
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto border-t border-white/10 pt-4 text-sm text-white/60"
                >
                  <p className="font-semibold text-white">{companyName}</p>
                  <p className="mt-1 text-xs">{settings?.address || 'Premium used car dealership'}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span>© {new Date().getFullYear()}</span>
                    <span className="w-px h-3 bg-white/10"></span>
                    <span>All rights reserved</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}