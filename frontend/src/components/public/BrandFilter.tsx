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
    <section className="mobile-brand-section premium-shell py-3 sm:py-5 lg:py-6">
      <div className="mobile-brand-strip flex gap-2 overflow-x-auto pb-0 scrollbar-hide lg:justify-center">
        {BRANDS.map((brand) => {
          const isActive = active === brand.value;

          return (
            <button
              key={brand.value}
              type="button"
              onClick={() => onSelect(brand.value)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-300 sm:px-4 sm:py-2 ${
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
    </section>
  );
}
