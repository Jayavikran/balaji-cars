const BRANDS = [
  { value: 'All', label: 'All Brands' },
  { value: 'Maruti Suzuki', label: 'Maruti Suzuki' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Mahindra', label: 'Mahindra' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Honda', label: 'Honda' },
  { value: 'BMW', label: 'BMW' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'MG', label: 'MG' },
];

interface BrandFilterProps {
  active: string;
  onSelect: (brand: string) => void;
}

export default function BrandFilter({ active, onSelect }: BrandFilterProps) {
  return (
    <section className="mobile-brand-section py-2 sm:py-3 lg:py-4 border-b border-line dark:border-white/10 bg-white/50 backdrop-blur-sm sticky top-[105px] sm:top-[116px] lg:top-[128px] z-30">
      <div className="container mx-auto px-4">
        <div className="mobile-brand-strip flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:justify-center">
          {BRANDS.map((brand) => {
            const isActive = active === brand.value;

            return (
              <button
                key={brand.value}
                type="button"
                onClick={() => onSelect(brand.value)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-300 active:scale-95 ${
                  isActive
                    ? 'border-[#F4B400] bg-[#0F0F10] text-white shadow-card'
                    : 'border-line bg-white text-ink hover:border-[#F4B400] hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80'
                }`}
              >
                {brand.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}