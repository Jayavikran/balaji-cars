import { memo, useCallback } from 'react';
import type { CarFilters } from '@/api/cars';

type StatusValue = CarFilters['status'] | undefined;

interface TabConfig {
  label: string;
  value: StatusValue;
  ariaLabel: string;
}

interface StatusTabsProps {
  active: StatusValue;
  onChange: (status: StatusValue) => void;
  counts?: {
    all?: number;
    available?: number;
    sold?: number;
    reserved?: number;
  };
  className?: string;
}

const TABS: TabConfig[] = [
  { label: 'All', value: undefined, ariaLabel: 'Show all cars' },
  { label: 'Available', value: 'Available', ariaLabel: 'Show only available cars' },
  { label: 'Sold', value: 'Sold', ariaLabel: 'Show only sold cars' },
  { label: 'Reserved', value: 'Reserved', ariaLabel: 'Show only reserved cars' },
];

const StatusTabs = memo(function StatusTabs({ 
  active, 
  onChange, 
  counts = {},
  className = '' 
}: StatusTabsProps) {
  
  const handleTabClick = useCallback((value: StatusValue) => {
    onChange(value);
  }, [onChange]);

  const getCount = (value: StatusValue): number | undefined => {
    if (value === undefined) return counts.all;
    if (value === 'Available') return counts.available;
    if (value === 'Sold') return counts.sold;
    if (value === 'Reserved') return counts.reserved;
    return undefined;
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 bg-surface dark:bg-white/5 rounded-full p-1 ${className}`}
      role="tablist"
      aria-label="Filter cars by status"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        const count = getCount(tab.value);
        
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            aria-label={`${tab.ariaLabel}${count !== undefined ? ` (${count} cars)` : ''}`}
            onClick={() => handleTabClick(tab.value)}
            className={`
              inline-flex items-center gap-1.5
              px-2.5 sm:px-3.5 lg:px-4 
              py-1.5 lg:py-2 
              rounded-full 
              text-[11px] sm:text-xs lg:text-sm 
              font-semibold 
              transition-all duration-200 
              whitespace-nowrap
              focus:outline-none 
              focus-visible:ring-2 
              focus-visible:ring-[#F4B400] 
              focus-visible:ring-offset-2 
              focus-visible:ring-offset-white
              dark:focus-visible:ring-offset-surface-dark
              ${isActive 
                ? 'bg-[#F4B400] text-black shadow-card hover:bg-[#f7c233] hover:scale-[1.02]' 
                : 'text-body hover:text-ink hover:bg-white/50 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10'
              }
              disabled:opacity-50 
              disabled:cursor-not-allowed
            `}
            disabled={isActive}
          >
            {tab.label}
            {count !== undefined && count > 0 && (
              <span className={`
                text-[10px] font-medium px-1.5 py-0.5 rounded-full
                ${isActive 
                  ? 'bg-black/10 text-black/80' 
                  : 'bg-[#F4B400]/10 text-[#F4B400]'
                }
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

StatusTabs.displayName = 'StatusTabs';

export default StatusTabs;