import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, Car } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import type { SiteSettings } from '@/types';

interface HeaderProps {
  settings?: SiteSettings;
  search: string;
  onSearchChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  onOpenFilters: () => void;
}

export default function Header({ 
  settings, 
  search, 
  onSearchChange, 
  onOpenFilters 
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { favorites } = useFavorites();
  const searchRef = useRef<HTMLDivElement>(null);

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 h-full max-w-screen-xl mx-auto gap-2">
        {/* Logo - hide text on mobile */}
        <Link to="/" className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-xs">
            {(settings?.companyName || 'BC').slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-ink dark:text-white text-sm hidden sm:inline">
            {settings?.companyName || 'BALAJI CARS'}
          </span>
        </Link>

        {/* Search Bar - Full width on mobile when focused */}
        <div 
          ref={searchRef} 
          className={`flex-1 transition-all duration-300 ${isSearchFocused ? 'max-w-full' : 'max-w-xs'}`}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cars..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full h-10 rounded-full border-0 bg-gray-50/80 dark:bg-white/5 pl-9 pr-4 text-sm text-ink dark:text-white placeholder:text-body/70 focus:ring-2 focus:ring-emerald transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Icons - Only Wishlist & Profile on mobile */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button 
            className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Favorites"
          >
            <Heart className="w-5 h-5 text-ink dark:text-white/90" />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald text-white text-[10px] flex items-center justify-center font-semibold">
                {favorites.length}
              </span>
            )}
          </button>
          <button 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Profile"
          >
            <User className="w-5 h-5 text-ink dark:text-white/90" />
          </button>
        </div>
      </div>
    </header>
  );
}