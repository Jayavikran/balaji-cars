import { memo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Phone, GitCompare, Share2, Eye, Camera, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Car } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { useCompare } from '@/hooks/useCompare';
import { estimateStartingEmi } from '@/utils/emi';
import { optimizeImage } from '@/utils/optimizeImage';
import QuickViewModal from './QuickViewModal';

interface CarCardProps {
  car: Car;
  badge?: string; // extra context badge computed by parent (e.g. "Best Deal", "Low KM")
}

function formatPrice(price: number) {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function isNewArrival(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 14;
}

function isRecentlyAdded(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days > 14 && days <= 30;
}

function CarCard({ car, badge }: CarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [hoverImgIndex, setHoverImgIndex] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fav = isFavorite(car._id);
  const comparing = isComparing(car._id);
  const images = car.images?.length ? car.images : [{ url: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=800&auto=format&fit=crop' }];
  const cover = optimizeImage(images[hoverImgIndex]?.url || images[0].url, 500);

  const whatsapp = car.whatsappNumber;
  const phone = car.phoneNumber;
  const priceDropped = !!car.previousPrice && car.previousPrice > car.price;
  const startingEmi = estimateStartingEmi(car.price);

  const startHoverSlider = () => {
    if (images.length < 2) return;
    hoverTimer.current = setInterval(() => {
      setHoverImgIndex((i) => (i + 1) % images.length);
    }, 1000);
  };

  const stopHoverSlider = () => {
    if (hoverTimer.current) clearInterval(hoverTimer.current);
    hoverTimer.current = null;
    setHoverImgIndex(0);
  };

  const handleToggleCompare = (e: MouseEvent) => {
    e.preventDefault();
    const result = toggleCompare(car);
    if (result === 'full') toast.error('You can compare up to 3 cars at a time.');
    else if (result === 'added') toast.success('Added to compare.');
  };

  const handleShare = (e: MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({ title: `${car.brand} ${car.model}`, url: `${window.location.origin}/cars/${car.slug}` });
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/cars/${car.slug}`);
      toast.success('Link copied to clipboard.');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onMouseEnter={startHoverSlider}
        onMouseLeave={stopHoverSlider}
        className="group relative bg-white dark:bg-[#111a2c] rounded-2xl lg:rounded-[22px] shadow-sm sm:shadow-md lg:shadow-xl sm:hover:shadow-xl lg:hover:shadow-2xl dark:shadow-black/20 transition-[box-shadow,transform] duration-300 ease-out lg:hover:-translate-y-2 overflow-hidden border border-line/60 sm:border-transparent dark:border-white/10 h-full flex flex-col"
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0">
          <img
            src={cover}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
          />

          {/* New Arrival ribbon */}
          {isNewArrival(car.createdAt) && (
            <div className="absolute top-2.5 sm:top-3 -left-8 rotate-[-45deg] bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wide py-1 w-28 sm:w-32 text-center shadow-md">
              New Arrival
            </div>
          )}

          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-1.5 items-end lg:left-3 lg:right-auto lg:top-12 lg:items-start">
            {car.isFeatured && <span className="badge badge-featured backdrop-blur-sm !text-[9px] sm:!text-[11px] !px-2 sm:!px-2.5 !py-0.5 sm:!py-1">Featured</span>}
            {priceDropped && <span className="badge badge-price-drop backdrop-blur-sm !text-[9px] sm:!text-[11px] !px-2 sm:!px-2.5 !py-0.5 sm:!py-1">Price Drop</span>}
            {!isNewArrival(car.createdAt) && isRecentlyAdded(car.createdAt) && (
              <span className="hidden sm:inline-flex badge bg-white/90 dark:bg-black/50 text-ink dark:text-white backdrop-blur-sm">Recently Added</span>
            )}
            {badge && <span className="hidden sm:inline-flex badge bg-white/90 dark:bg-black/50 text-ink dark:text-white backdrop-blur-sm">{badge}</span>}
          </div>

          {/* Favourite — always visible (touch-friendly). Compare / Share
              stay hover-revealed on desktop only, per "no animation on
              mobile"; they're not hidden outright so the feature is still
              reachable there via the details page. */}
          <button
            type="button"
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={fav}
            onClick={(e) => { e.preventDefault(); toggleFavorite(car); }}
            className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md sm:hover:scale-110 transition-transform duration-200 lg:bottom-auto lg:top-3 lg:right-3 lg:w-9 lg:h-9"
          >
            <Heart size={13} className={fav ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-white/80'} />
          </button>

          <div className="hidden sm:flex absolute bottom-3 right-14 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100 lg:bottom-auto lg:top-3 lg:right-14 lg:gap-2">
            <button
              type="button"
              aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={comparing}
              onClick={handleToggleCompare}
              className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 ${
                comparing ? 'bg-navy text-white' : 'bg-white/95 dark:bg-black/60 text-gray-700 dark:text-white/80'
              }`}
            >
              <GitCompare size={14} />
            </button>
            <button
              type="button"
              aria-label="Share this car"
              onClick={handleShare}
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"
            >
              <Share2 size={13} className="text-gray-700 dark:text-white/80" />
            </button>
          </div>

          {/* Photo count + view count */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex gap-1 sm:gap-1.5">
            <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              <Camera size={10} /> {images.length}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
              <Eye size={11} /> {car.views}
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-5 flex flex-col flex-1">
          <Link to={`/cars/${car.slug}`} className="block">
            <h3 className="font-semibold text-gray-900 dark:text-white text-[13px] sm:text-lg lg:text-xl leading-snug truncate">
              {car.brand} {car.model} {car.variant}
            </h3>
          </Link>

          <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-2xl lg:text-[28px] font-bold text-green-600 dark:text-emerald">
              {formatPrice(car.price)}
            </span>
            {priceDropped && <span className="text-[10px] sm:text-xs text-body line-through">{formatPrice(car.previousPrice!)}</span>}
          </div>

          <p className="mt-0.5 sm:mt-1 hidden sm:flex items-center gap-1 text-xs text-navy dark:text-emerald font-medium">
            <Zap size={12} /> EMI starts from ₹{startingEmi.toLocaleString('en-IN')}/mo
          </p>

          <div className="mt-1.5 sm:mt-3 flex items-center text-gray-600 dark:text-white/60 text-[11px] sm:text-sm lg:text-[15px]">
            <span className="flex items-center gap-1 truncate">
              <span>📍</span> {car.location}
            </span>
          </div>

          <div className="mt-1.5 sm:mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-3 lg:gap-3.5 text-[11px] sm:text-sm lg:text-sm lg:font-medium text-gray-600 dark:text-white/60">
            <span className="flex items-center gap-1">
              <span>📅</span> {car.manufacturingYear}
            </span>
            <span className="flex items-center gap-1">
              <span>⛽</span> {car.fuelType}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <span>⚙</span> {car.transmission}
            </span>
          </div>

          <div className="mt-auto pt-2.5 sm:pt-4 flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {phone && (
              <a
                href={`tel:${phone}`}
                aria-label="Call seller"
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-white font-medium h-11 px-3 sm:px-4 rounded-xl lg:rounded-[14px] transition-colors duration-200 text-xs sm:text-sm"
              >
                <Phone size={15} />
                Contact
              </a>
            )}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.brand} ${car.model}`)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Contact on WhatsApp"
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl lg:rounded-[14px] bg-green-100 dark:bg-green-500/15 hover:bg-green-200 dark:hover:bg-green-500/25 text-green-700 dark:text-green-400 transition-colors duration-200 shrink-0"
              >
                <MessageCircle size={18} />
              </a>
            )}

            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              aria-label="Quick view"
              className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-xl lg:rounded-[14px] bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white/80 transition-colors duration-200 shrink-0"
            >
              <Eye size={17} />
            </button>
          </div>

          <div className="mt-2 sm:mt-4">
            <Link
              to={`/cars/${car.slug}`}
              className="flex items-center justify-center w-full text-center bg-gray-900 dark:bg-emerald hover:bg-gray-800 dark:hover:bg-emerald-dark text-white font-medium h-11 px-4 rounded-xl lg:rounded-[14px] transition-colors duration-200 text-xs sm:text-sm lg:hover:scale-[1.02]"
            >
              View Details →
            </Link>
          </div>
        </div>
      </motion.div>

      <QuickViewModal car={quickViewOpen ? car : null} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}

// Cards re-render only when their own car data or badge prop actually
// changes — important on the Home grid, where a background filter refetch
// (react-query's keepPreviousData) would otherwise re-render every card.
export default memo(CarCard);
