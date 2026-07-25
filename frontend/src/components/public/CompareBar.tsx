import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, GitCompare } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { optimizeImage } from '@/utils/optimizeImage';

/**
 * Fixed bottom bar that appears once at least one car is selected for
 * comparison. Mounted once near the app root (see App.tsx) so it persists
 * across navigation, matching the Cars24/Spinny "sticky compare tray" UX.
 */
export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, maxCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#111a2c] border-t border-line dark:border-white/10 shadow-cardHover"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <GitCompare size={18} className="text-navy dark:text-emerald" />
              <span className="text-sm font-semibold text-ink dark:text-white">
                Compare ({compareList.length}/{maxCompare})
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
              {compareList.map((car) => (
                <div
                  key={car._id}
                  className="flex items-center gap-2 bg-surface dark:bg-white/5 rounded-full pl-1 pr-2 py-1 shrink-0"
                >
                  <img
                    src={optimizeImage(car.images?.[0]?.url, 80)}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-ink dark:text-white/90 max-w-[100px] truncate">
                    {car.brand} {car.model}
                  </span>
                  <button
                    onClick={() => removeFromCompare(car._id)}
                    aria-label={`Remove ${car.brand} ${car.model} from compare`}
                    className="text-body hover:text-red-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button onClick={clearCompare} className="text-xs text-body hover:text-red-500 px-2">
                Clear
              </button>
              <button
                onClick={() => navigate('/compare')}
                disabled={compareList.length < 2}
                className="btn-primary !py-2 !px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
