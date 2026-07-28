import { memo, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GitCompare, Share2, Calendar, Fuel, Settings2, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Car } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { useCompare } from '@/hooks/useCompare';
import { optimizeImage } from '@/utils/optimizeImage';

interface CarCardProps {
  car: Car;
  badge?: string;
}

function formatPrice(price: number) {
  if (price >= 100000) return `Rs ${(price / 100000).toFixed(2)} Lakh`;
  return `Rs ${price.toLocaleString('en-IN')}`;
}

function CarCard({ car, badge }: CarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();

  const fav = isFavorite(car._id);
  const comparing = isComparing(car._id);
  const images = car.images?.length ? car.images : [{ url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop' }];
  const cover = optimizeImage(images[0]?.url, 900);

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
      className="car-card group relative overflow-hidden rounded-[24px] border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover dark:border-white/10 dark:bg-[#111a2c]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
        <img
          src={cover}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-85" />

        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm">
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
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-ink shadow-card backdrop-blur-md transition-transform duration-300 hover:scale-105"
        >
          <Heart size={16} className={fav ? 'fill-red-500 text-red-500' : 'text-ink'} />
        </button>

        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {car.images?.length || 1} photos
          </span>
        </div>

        <div className="absolute right-3 bottom-3 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
            aria-pressed={comparing}
            onClick={handleToggleCompare}
            className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
              comparing ? 'bg-[#F4B400] text-black' : 'bg-white/92 text-ink'
            }`}
          >
            <GitCompare size={14} />
          </button>
          <button
            type="button"
            aria-label="Share this car"
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-ink backdrop-blur-md transition-colors"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-5 lg:p-6">
        <Link to={`/cars/${car.slug}`} className="block">
          <h3 className="line-clamp-2 text-[1.04rem] font-bold leading-snug text-ink transition-colors group-hover:text-[#F4B400] dark:text-white sm:text-[1.08rem]">
            {car.brand} {car.model} {car.variant}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-body dark:text-white/65">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
            <Calendar size={12} className="text-[#F4B400]" />
            {car.manufacturingYear}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
            <Fuel size={12} className="text-[#F4B400]" />
            {car.fuelType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
            <Settings2 size={12} className="text-[#F4B400]" />
            {car.transmission}
          </span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-body dark:text-white/70">
          <MapPin size={14} className="text-[#F4B400]" />
          {car.location}
        </p>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-body dark:text-white/50">Price</p>
            <p className="mt-1 break-words text-[1.15rem] font-extrabold leading-tight text-[#F4B400] sm:text-xl">{formatPrice(car.price)}</p>
          </div>

          <Link
            to={`/cars/${car.slug}`}
            className="inline-flex h-11 w-[156px] shrink-0 items-center justify-between rounded-full bg-black px-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#F4B400] hover:text-black sm:h-[52px] sm:w-[170px] sm:px-6"
          >
            <span>View Details</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(CarCard);
