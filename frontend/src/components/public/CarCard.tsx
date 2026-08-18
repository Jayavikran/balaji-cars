// src/components/public/CarCard.tsx
import { memo, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GitCompare, Share2, Calendar, Fuel, Settings2, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Car } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { useCompare } from '@/hooks/useCompare';
import { optimizeImage } from '@/utils/optimizeImage';
import LazyImage from '@/components/shared/LazyImage';

interface CarCardProps {
  car: Car;
  badge?: string;
  priority?: boolean;
}

function formatPrice(price: number) {
  if (price >= 100000) return `Rs ${(price / 100000).toFixed(2)} Lakh`;
  return `Rs ${price.toLocaleString('en-IN')}`;
}

function CarCard({ car, badge, priority = false }: CarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();

  const fav = isFavorite(car._id);
  const comparing = isComparing(car._id);

  const rawUrl = car.images?.[0]?.url || '';
  const cover = optimizeImage(rawUrl, 600);

  const handleToggleCompare = (e: MouseEvent) => {
    e.preventDefault();
    const result = toggleCompare(car);
    if (result === 'full') toast.error('You can compare up to 3 cars at a time.');
    else if (result === 'added') toast.success('Added to compare.');
  };

  const handleShare = (e: MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/cars/${car.slug}`;
    if (navigator.share) {
      navigator.share({ title: `${car.brand} ${car.model}`, url });
    } else {
      navigator.clipboard?.writeText(url);
      toast.success('Link copied to clipboard.');
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="car-card group relative overflow-hidden rounded-2xl sm:rounded-[24px] border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover dark:border-white/10 dark:bg-[#111a2c]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
        <LazyImage
          src={cover}
          alt={`${car.manufacturingYear} ${car.brand} ${car.model}${car.variant ? ` ${car.variant}` : ''} used car`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          fallback="/images/placeholder-car.jpg"
          rootMargin="200px"
          preload={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-85" />

        {badge && (
          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-ink shadow-sm">
            {badge}
          </span>
        )}

        <button
          type="button"
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={fav}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(car);
          }}
          className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/92 text-ink shadow-card backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-90"
        >
          <Heart size={16} className={fav ? 'fill-red-500 text-red-500' : 'text-ink'} />
        </button>

        <div className="absolute left-2 bottom-2 sm:left-3 sm:bottom-3 flex items-center gap-2">
          <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-white backdrop-blur-sm">
            {car.images?.length || 1} photos
          </span>
        </div>

        <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 flex items-center gap-1.5 sm:gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
            aria-pressed={comparing}
            onClick={handleToggleCompare}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
              comparing ? 'bg-[#F4B400] text-black' : 'bg-white/92 text-ink'
            }`}
          >
            <GitCompare size={14} />
          </button>
          <button
            type="button"
            aria-label="Share this car"
            onClick={handleShare}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/92 text-ink backdrop-blur-md transition-colors"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col p-3 sm:p-4 lg:p-6">
        <Link to={`/cars/${car.slug}`} className="block">
          <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug text-ink transition-colors group-hover:text-[#F4B400] dark:text-white">
            {car.brand} {car.model} {car.variant}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-medium text-body dark:text-white/65">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 sm:px-2.5 sm:py-1">
            <Calendar size={12} className="text-[#F4B400]" />
            {car.manufacturingYear}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 sm:px-2.5 sm:py-1">
            <Fuel size={12} className="text-[#F4B400]" />
            {car.fuelType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 sm:px-2.5 sm:py-1">
            <Settings2 size={12} className="text-[#F4B400]" />
            {car.transmission}
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-body dark:text-white/70">
          <MapPin size={14} className="text-[#F4B400]" />
          {car.location}
        </p>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-body dark:text-white/50">Price</p>
            <p className="mt-1 break-words text-base font-extrabold leading-tight text-[#F4B400] sm:text-xl">
              {formatPrice(car.price)}
            </p>
          </div>

          <Link
            to={`/cars/${car.slug}`}
            className="inline-flex h-10 sm:h-11 w-[130px] sm:w-[156px] shrink-0 items-center justify-between rounded-full bg-white px-4 text-xs sm:text-sm font-semibold text-black transition-all duration-300 hover:bg-[#F4B400] hover:text-black sm:px-5"
          >
            <span>View Details</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(CarCard);
