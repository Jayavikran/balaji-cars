import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gauge, Calendar, Fuel, Users, MapPin, ArrowRight } from 'lucide-react';
import type { Car } from '@/types';
import { optimizeImage } from '@/utils/optimizeImage';

function formatPrice(price: number) {
  return `Rs ${(price / 100000).toFixed(2)} Lakh`;
}

export default function QuickViewModal({ car, onClose }: { car: Car | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {car && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Quick view: ${car.brand} ${car.model}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-line bg-white shadow-[0_24px_80px_rgba(0,0,0,.25)]"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/90 text-ink shadow-card"
            >
              <X size={16} />
            </button>

            <div className="relative">
              <img
                src={optimizeImage(car.images?.[0]?.url, 1200)}
                alt={`${car.brand} ${car.model}`}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.5),transparent_55%)]" />
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Quick Preview</p>
              <h3 className="mt-2 text-2xl font-extrabold text-ink">
                {car.brand} {car.model} {car.variant}
              </h3>
              <p className="mt-1 text-2xl font-bold text-[#F4B400]">{formatPrice(car.price)}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Calendar, label: String(car.manufacturingYear) },
                  { icon: Gauge, label: `${car.kilometersDriven.toLocaleString('en-IN')} km` },
                  { icon: Fuel, label: car.fuelType },
                  { icon: Users, label: `${car.seats} Seats` },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5 text-xs font-medium text-ink">
                    <s.icon size={14} className="text-[#F4B400] shrink-0" /> {s.label}
                  </div>
                ))}
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-sm text-body">
                <MapPin size={14} className="text-[#F4B400]" /> {car.location}
              </p>

              {car.description && (
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-body">{car.description}</p>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/cars/${car.slug}`}
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F4B400] px-5 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.01]"
                >
                  View Full Details
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#F4B400] hover:text-[#F4B400]"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
