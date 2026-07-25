import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gauge, Calendar, Fuel, Users, MapPin } from 'lucide-react';
import type { Car } from '@/types';
import { optimizeImage } from '@/utils/optimizeImage';

function formatPrice(price: number) {
  return `₹${(price / 100000).toFixed(2)} Lakh`;
}

export default function QuickViewModal({ car, onClose }: { car: Car | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {car && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Quick view: ${car.brand} ${car.model}`}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative surface-card rounded-card w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center shadow-card"
            >
              <X size={16} />
            </button>

            <img src={optimizeImage(car.images?.[0]?.url, 800)} alt={`${car.brand} ${car.model}`} className="w-full aspect-[16/9] object-cover" />

            <div className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">{car.brand} {car.model} {car.variant}</h3>
              <p className="price-tag text-2xl mt-1">{formatPrice(car.price)}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { icon: Calendar, label: car.manufacturingYear },
                  { icon: Gauge, label: `${car.kilometersDriven.toLocaleString('en-IN')} km` },
                  { icon: Fuel, label: car.fuelType },
                  { icon: Users, label: `${car.seats} Seats` },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface dark:bg-white/5 rounded-xl px-3 py-2.5 text-xs text-ink dark:text-white/80">
                    <s.icon size={14} className="text-navy dark:text-emerald shrink-0" /> {s.label}
                  </div>
                ))}
              </div>

              <p className="flex items-center gap-1.5 text-sm text-body mt-4">
                <MapPin size={14} /> {car.location}
              </p>

              {car.description && (
                <p className="text-sm text-body leading-relaxed mt-3 line-clamp-3">{car.description}</p>
              )}

              <Link to={`/cars/${car.slug}`} onClick={onClose} className="btn-primary w-full mt-5">
                View Full Details
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
