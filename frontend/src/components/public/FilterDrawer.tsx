import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CarFilters } from '@/api/cars';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: CarFilters;
  onChange: (filters: CarFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const OWNERS = ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'];
const BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'EV', 'MUV', 'Coupe', 'Convertible', 'Pickup'];
const SEATS = [2, 4, 5, 6, 7];

export default function FilterDrawer({ open, onClose, filters, onChange, onApply, onReset }: FilterDrawerProps) {
  const toggleMulti = (key: keyof CarFilters, value: string) => {
    const current = (filters[key] as string | undefined)?.split(',').filter(Boolean) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next.join(',') || undefined });
  };

  const isActive = (key: keyof CarFilters, value: string) =>
    ((filters[key] as string | undefined)?.split(',') || []).includes(value);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50" onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-[#111a2c] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="sticky top-0 bg-white dark:bg-[#111a2c] border-b border-line dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h3 className="font-display font-bold text-lg text-ink dark:text-white">Advanced Filters</h3>
              <button onClick={onClose} aria-label="Close filters" className="p-2 hover:bg-surface rounded-full transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <FilterGroup title="Price Range">
                <RangeInputs
                  min={filters.minPrice} max={filters.maxPrice}
                  minPlaceholder="Min Price" maxPlaceholder="Max Price"
                  onMinChange={(v) => onChange({ ...filters, minPrice: v })}
                  onMaxChange={(v) => onChange({ ...filters, maxPrice: v })}
                  step={50000} sliderMax={10000000}
                />
              </FilterGroup>

              <FilterGroup title="Kilometers Driven">
                <RangeInputs
                  min={filters.minKm} max={filters.maxKm}
                  minPlaceholder="Min KM" maxPlaceholder="Max KM"
                  onMinChange={(v) => onChange({ ...filters, minKm: v })}
                  onMaxChange={(v) => onChange({ ...filters, maxKm: v })}
                  step={5000} sliderMax={200000}
                />
              </FilterGroup>

              <FilterGroup title="Body Type">
                <ChipGroup options={BODY_TYPES} isActive={(v) => isActive('bodyType', v)} onToggle={(v) => toggleMulti('bodyType', v)} />
              </FilterGroup>

              <FilterGroup title="Fuel Type">
                <ChipGroup options={FUEL_TYPES} isActive={(v) => isActive('fuelType', v)} onToggle={(v) => toggleMulti('fuelType', v)} />
              </FilterGroup>

              <FilterGroup title="Transmission">
                <ChipGroup options={TRANSMISSIONS} isActive={(v) => isActive('transmission', v)} onToggle={(v) => toggleMulti('transmission', v)} />
              </FilterGroup>

              <FilterGroup title="Owner Type">
                <ChipGroup options={OWNERS} isActive={(v) => isActive('owner', v)} onToggle={(v) => toggleMulti('owner', v)} />
              </FilterGroup>

              <FilterGroup title="Seats">
                <ChipGroup options={SEATS.map(String)} isActive={(v) => String(filters.seats) === v} onToggle={(v) => onChange({ ...filters, seats: Number(v) })} />
              </FilterGroup>

              <FilterGroup title="Manufacturing Year">
                <input
                  type="number" placeholder="e.g. 2022"
                  value={filters.manufacturingYear || ''}
                  onChange={(e) => onChange({ ...filters, manufacturingYear: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-line dark:border-white/15 dark:bg-white/5 dark:text-white rounded-xl px-3 py-2 text-sm"
                />
              </FilterGroup>

              <FilterGroup title="Location">
                <input
                  type="text" placeholder="City or area"
                  value={filters.location || ''}
                  onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
                  className="w-full border border-line dark:border-white/15 dark:bg-white/5 dark:text-white rounded-xl px-3 py-2 text-sm"
                />
              </FilterGroup>

              <FilterGroup title="Preferences">
                <div className="space-y-2">
                  <Toggle label="Insurance Active Only" checked={!!filters.insuranceActiveOnly} onChange={(v) => onChange({ ...filters, insuranceActiveOnly: v || undefined })} />
                  <Toggle label="FC Valid Only" checked={!!filters.fcValidOnly} onChange={(v) => onChange({ ...filters, fcValidOnly: v || undefined })} />
                  <Toggle label="Featured Cars" checked={!!filters.featuredOnly} onChange={(v) => onChange({ ...filters, featuredOnly: v || undefined })} />
                  <Toggle label="Available Cars Only" checked={!!filters.availableOnly} onChange={(v) => onChange({ ...filters, availableOnly: v || undefined })} />
                </div>
              </FilterGroup>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-[#111a2c] border-t border-line dark:border-white/10 p-4 flex gap-3">
              <button onClick={onReset} className="btn-outline flex-1">Reset Filters</button>
              <button onClick={() => { onApply(); onClose(); }} className="btn-primary flex-1 bg-emerald hover:bg-emerald-dark">Apply Filters</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-medium text-sm text-ink dark:text-white mb-2.5">{title}</p>
      {children}
    </div>
  );
}

function ChipGroup({ options, isActive, onToggle }: { options: string[]; isActive: (v: string) => boolean; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isActive(opt) ? 'bg-navy dark:bg-emerald text-white border-navy dark:border-emerald' : 'bg-white dark:bg-transparent text-ink dark:text-white/80 border-line dark:border-white/15 hover:border-navy dark:hover:border-white/40'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function RangeInputs({
  min, max, onMinChange, onMaxChange, minPlaceholder, maxPlaceholder, step, sliderMax,
}: {
  min?: number; max?: number; onMinChange: (v?: number) => void; onMaxChange: (v?: number) => void;
  minPlaceholder: string; maxPlaceholder: string; step: number; sliderMax: number;
}) {
  return (
    <div>
      <div className="flex gap-3 mb-3">
        <input
          type="number" placeholder={minPlaceholder} value={min ?? ''}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-1/2 border border-line dark:border-white/15 dark:bg-white/5 dark:text-white rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="number" placeholder={maxPlaceholder} value={max ?? ''}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-1/2 border border-line dark:border-white/15 dark:bg-white/5 dark:text-white rounded-xl px-3 py-2 text-sm"
        />
      </div>
      <input
        type="range" min={0} max={sliderMax} step={step} value={max ?? sliderMax}
        onChange={(e) => onMaxChange(Number(e.target.value))}
        className="w-full accent-emerald"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-sm text-ink dark:text-white/90">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full transition-colors relative ${checked ? 'bg-emerald' : 'bg-line'}`}
        style={{ height: '22px' }}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  );
}