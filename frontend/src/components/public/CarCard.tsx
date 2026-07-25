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
        className="group relative bg-white dark:bg-[#111a2c] rounded-2xl shadow-md hover:shadow-xl dark:shadow-black/20 transition-shadow duration-300 overflow-hidden border border-transparent dark:border-white/10"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/5">
          <img
            src={cover}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* New Arrival ribbon */}
          {isNewArrival(car.createdAt) && (
            <div className="absolute top-3 -left-8 rotate-[-45deg] bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide py-1 w-32 text-center shadow-md">
              New Arrival
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {car.isFeatured && <span className="badge badge-featured backdrop-blur-sm">Featured</span>}
            {priceDropped && <span className="badge badge-price-drop backdrop-blur-sm">Price Dropped</span>}
            {!isNewArrival(car.createdAt) && isRecentlyAdded(car.createdAt) && (
              <span className="badge bg-white/90 dark:bg-black/50 text-ink dark:text-white backdrop-blur-sm">Recently Added</span>
            )}
            {badge && <span className="badge bg-white/90 dark:bg-black/50 text-ink dark:text-white backdrop-blur-sm">{badge}</span>}
          </div>

          {/* Photo count + view count */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
              <Camera size={11} /> {images.length}
            </span>
            <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
              <Eye size={11} /> {car.views}
            </span>
          </div>

          {/* Action buttons: favourite / compare / share / quick view */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
            <button
              type="button"
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={fav}
              onClick={(e) => { e.preventDefault(); toggleFavorite(car); }}
              className="w-8 h-8 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"
            >
              <Heart size={14} className={fav ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-white/80'} />
            </button>
            <button
              type="button"
              aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={comparing}
              onClick={handleToggleCompare}
              className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 ${
                comparing ? 'bg-navy text-white' : 'bg-white/95 dark:bg-black/60 text-gray-700 dark:text-white/80'
              }`}
            >
              <GitCompare size={14} />
            </button>
            <button
              type="button"
              aria-label="Share this car"
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"
            >
              <Share2 size={13} className="text-gray-700 dark:text-white/80" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <Link to={`/cars/${car.slug}`} className="block">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-snug truncate">
              {car.brand} {car.model} {car.variant}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold text-green-600 dark:text-emerald">
              {formatPrice(car.price)}
            </span>
            {priceDropped && <span className="text-xs text-body line-through">{formatPrice(car.previousPrice!)}</span>}
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-navy dark:text-emerald font-medium">
            <Zap size={12} /> EMI starts from ₹{startingEmi.toLocaleString('en-IN')}/mo
          </p>

          <div className="mt-3 flex items-center text-gray-600 dark:text-white/60 text-sm">
            <span className="flex items-center gap-1">
              <span>📍</span> {car.location}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-white/60">
            <span className="flex items-center gap-1">
              <span>📅</span> {car.manufacturingYear}
            </span>
            <span className="flex items-center gap-1">
              <span>⛽</span> {car.fuelType}
            </span>
            <span className="flex items-center gap-1">
              <span>⚙</span> {car.transmission}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                aria-label="Call seller"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm"
              >
                <Phone size={16} />
                Contact
              </a>
            )}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.brand} ${car.model}`)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Contact on WhatsApp"
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-green-100 dark:bg-green-500/15 hover:bg-green-200 dark:hover:bg-green-500/25 text-green-700 dark:text-green-400 transition-colors duration-200"
              >
                <MessageCircle size={18} />
              </a>
            )}

            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              aria-label="Quick view"
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white/80 transition-colors duration-200"
            >
              <Eye size={17} />
            </button>
          </div>

          <div className="mt-4">
            <Link
              to={`/cars/${car.slug}`}
              className="block w-full text-center bg-gray-900 dark:bg-emerald hover:bg-gray-800 dark:hover:bg-emerald-dark text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 text-sm"
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
