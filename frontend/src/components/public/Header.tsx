import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Heart, MapPin, Menu, X, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchSuggestions } from '@/api/cars';
import { useFavorites } from '@/hooks/useFavorites';
import type { SiteSettings } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'km_low_high', label: 'Kilometers: Low to High' },
  { value: 'km_high_low', label: 'Kilometers: High to Low' },
  { value: 'year_newest', label: 'Year: Newest' },
  { value: 'year_oldest', label: 'Year: Oldest' },
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'featured_first', label: 'Featured First' },
];

interface HeaderProps {
  settings?: SiteSettings;
  search: string;
  onSearchChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  onOpenFilters: () => void;
}

export default function Header({ settings, search, onSearchChange, sort, onSortChange, onOpenFilters }: HeaderProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions', search],
    queryFn: () => fetchSearchSuggestions(search),
    enabled: search.trim().length > 1,
  });

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-sm border-b border-line dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center text-white font-display font-bold text-sm">
              {(settings?.companyName || 'BC').slice(0, 2).toUpperCase()}
            </div>
            <span className="font-display font-bold text-ink dark:text-white text-lg hidden sm:inline">
              {settings?.companyName || 'BALAJI CARS'}
            </span>
          </Link>

          <div ref={searchRef} className="relative flex-1 max-w-xl mx-auto hidden md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              type="text"
              placeholder="Search by Brand, Model, Variant, Registration Number or Year..."
              className="w-full bg-surface dark:bg-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm text-ink dark:text-white placeholder:text-body/70 border border-transparent focus:border-navy dark:focus:border-emerald focus:bg-white dark:focus:bg-white/10 transition-colors"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#111a2c] rounded-2xl shadow-cardHover border border-line dark:border-white/10 overflow-hidden animate-slideUp">
                {suggestions.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => { navigate(`/cars/${s.slug}`); setShowSuggestions(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-ink dark:text-white/90 hover:bg-surface dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Search size={13} className="text-body" /> {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-white/90 px-3 py-2 rounded-full hover:bg-surface dark:hover:bg-white/5 transition-colors"
              >
                <ArrowUpDown size={15} /> Sort
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111a2c] rounded-2xl shadow-cardHover border border-line dark:border-white/10 py-2 z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface dark:hover:bg-white/5 transition-colors ${sort === opt.value ? 'text-emerald font-semibold' : 'text-ink dark:text-white/90'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-white/90 px-3 py-2 rounded-full hover:bg-surface dark:hover:bg-white/5 transition-colors"
            >
              <SlidersHorizontal size={15} /> Filter
            </button>

            <button
              onClick={() => setFavOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface dark:hover:bg-white/5 transition-colors"
              aria-label="Favourites"
            >
              <Heart size={18} className="text-ink dark:text-white/90" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald text-white text-[10px] flex items-center justify-center font-semibold">
                  {favorites.length}
                </span>
              )}
            </button>

            <button className="flex items-center gap-1 text-sm font-medium text-ink dark:text-white/90 px-3 py-2 rounded-full hover:bg-surface dark:hover:bg-white/5 transition-colors">
              <MapPin size={15} /> {settings?.address?.split(',')[0] || 'Location'}
            </button>
          </div>

          <button className="md:hidden ml-auto" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              type="text"
              placeholder="Search cars..."
              className="w-full bg-surface dark:bg-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm text-ink dark:text-white border border-transparent focus:border-navy dark:focus:border-emerald focus:bg-white dark:focus:bg-white/10 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-[#111a2c] p-6 animate-slideUp">
            <button onClick={() => setMobileOpen(false)} className="mb-6"><X size={22} /></button>
            <div className="flex flex-col gap-1">
              <button onClick={() => { onOpenFilters(); setMobileOpen(false); }} className="flex items-center gap-2 py-3 text-ink dark:text-white/90 font-medium border-b border-line dark:border-white/10">
                <SlidersHorizontal size={16} /> Filters
              </button>
              <button onClick={() => { setSortOpen(true); setMobileOpen(false); }} className="flex items-center gap-2 py-3 text-ink dark:text-white/90 font-medium border-b border-line dark:border-white/10">
                <ArrowUpDown size={16} /> Sort
              </button>
              <button onClick={() => { setFavOpen(true); setMobileOpen(false); }} className="flex items-center gap-2 py-3 text-ink dark:text-white/90 font-medium border-b border-line dark:border-white/10">
                <Heart size={16} /> Favourites ({favorites.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Favourites modal */}
      {favOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFavOpen(false)} />
          <div className="relative bg-white dark:bg-[#111a2c] rounded-card shadow-cardHover w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink dark:text-white">My Favourite Cars</h3>
              <button onClick={() => setFavOpen(false)}><X size={20} /></button>
            </div>
            {favorites.length === 0 ? (
              <p className="text-body text-sm py-10 text-center">No favourite cars yet.</p>
            ) : (
              <div className="space-y-3">
                {favorites.map((f) => (
                  <div key={f._id} className="flex items-center gap-3 border border-line dark:border-white/10 rounded-2xl p-3">
                    <img src={f.images?.[0]?.url} alt={f.model} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-ink dark:text-white">{f.brand} {f.model} {f.variant}</p>
                      <p className="text-emerald font-semibold text-sm">₹{(f.price / 100000).toFixed(2)} Lakh</p>
                      <p className="text-xs text-body">{f.manufacturingYear} · {f.location}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Link to={`/cars/${f.slug}`} onClick={() => setFavOpen(false)} className="text-xs btn-outline !px-3 !py-1.5">View</Link>
                      <button onClick={() => removeFavorite(f._id)} className="text-xs text-red-500 flex items-center gap-1 justify-center">
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
