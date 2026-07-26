const BRANDS = [
  'All', 'Maruti Suzuki', 'Mahindra', 'Hyundai', 'Toyota', 'Honda',
  'BMW', 'Audi', 'Kia', 'MG', 'Volkswagen',
];

interface BrandFilterProps {
  active: string;
  onSelect: (brand: string) => void;
}

export default function BrandFilter({ active, onSelect }: BrandFilterProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {BRANDS.map((brand) => (
          <button
            key={brand}
            onClick={() => onSelect(brand)}
            className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap ${
              active === brand
                ? 'bg-navy dark:bg-emerald text-white border-navy dark:border-emerald'
                : 'bg-white dark:bg-transparent text-ink dark:text-white/80 border-line dark:border-white/15 hover:border-navy dark:hover:border-white/40'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}
