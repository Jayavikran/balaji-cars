import type { CarFilters } from '@/api/cars';

type StatusValue = CarFilters['status'] | undefined;

const TABS: { label: string; value: StatusValue }[] = [
  { label: 'All', value: undefined },
  { label: 'Available', value: 'Available' },
  { label: 'Sold', value: 'Sold' },
  { label: 'Reserved', value: 'Reserved' },
];

interface StatusTabsProps {
  active: StatusValue;
  onChange: (status: StatusValue) => void;
}

/**
 * Available / Sold / Reserved / All — filters at the database level via
 * the `status` query param (see backend buildPublicFilter). The active
 * tab stays highlighted and is reflected in the URL by the parent.
 */
export default function StatusTabs({ active, onChange }: StatusTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-surface dark:bg-white/5 rounded-full p-1">
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={isActive}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap ${
              isActive ? 'bg-navy dark:bg-emerald text-white shadow-card' : 'text-body hover:text-ink dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
