import { memo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Phone, GitCompare, Share2, Camera, Zap } from 'lucide-react';
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
  badge?: string;
}

function formatPrice(price: number) {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function isNewArrival(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 14;
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
  const cover = optimizeImage(images[hoverImgIndex]?.url || images[0].url, 400);

  const whatsapp = car.whatsappNumber;
  const phone = car.phoneNumber;
  const priceDropped = !!car.previousPrice && car.previousPrice > car.price;
  const startingEmi = estimateStartingEmi(car.price);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="car-card-mobile relative bg-white dark:bg-[#111a2c] rounded-2xl shadow-md hover:shadow-xl dark:shadow-black/20 transition-shadow duration-300 overflow-hidden border border-transparent dark:border-white/10"
      >
        {/* Image Container - 4:3 Ratio */}
        <div className="relative car-image aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5">
          <img
            src={cover}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {car.isFeatured && (
              <span className="badge badge-featured text-[9px] px-1.5 py-0.5">Featured</span>
            )}
            {priceDropped && (
              <span className="badge badge-price-drop text-[9px] px-1.5 py-0.5">Price Drop</span>
            )}
            {isNewArrival(car.createdAt) && (
              <span className="badge badge-new text-[9px] px-1.5 py-0.5">New</span>
            )}
            {badge && (
              <span className="badge bg-white/90 dark:bg-black/50 text-ink dark:text-white text-[9px] px-1.5 py-0.5">{badge}</span>
            )}
          </div>

          {/* Photo count */}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
              <Camera size={10} /> {images.length}
            </span>
          </div>

          {/* Action buttons - Mobile optimized */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              type="button"
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              onClick={(e) => { e.preventDefault(); toggleFavorite(car); }}
              className="w-7 h-7 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md"
            >
              <Heart size={12} className={fav ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-white/80'} />
            </button>
            <button
              type="button"
              aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
              onClick={(e) => {
                e.preventDefault();
                const result = toggleCompare(car);
                if (result === 'full') toast.error('You can compare up to 3 cars at a time.');
              }}
              className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center shadow-md ${
                comparing ? 'bg-navy text-white' : 'bg-white/95 dark:bg-black/60 text-gray-700 dark:text-white/80'
              }`}
            >
              <GitCompare size={11} />
            </button>
            <button
              type="button"
              aria-label="Share this car"
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({ title: `${car.brand} ${car.model}`, url: `${window.location.origin}/cars/${car.slug}` });
                } else {
                  navigator.clipboard?.writeText(`${window.location.origin}/cars/${car.slug}`);
                  toast.success('Link copied.');
                }
              }}
              className="w-7 h-7 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md"
            >
              <Share2 size={11} className="text-gray-700 dark:text-white/80" />
            </button>
          </div>
        </div>

        {/* Card Content - Compact */}
        <div className="p-3 space-y-1.5">
          <Link to={`/cars/${car.slug}`} className="block">
            <h3 className="brand-name font-semibold text-ink dark:text-white text-sm leading-snug truncate">
              {car.brand} {car.model}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="car-price font-bold text-emerald text-lg">
              {formatPrice(car.price)}
            </span>
            {priceDropped && <span className="text-[10px] text-body line-through">{formatPrice(car.previousPrice!)}</span>}
          </div>

          <p className="car-location flex items-center gap-1 text-xs text-body">
            <span>📍</span> {car.location}
          </p>

          <div className="car-specs flex flex-wrap items-center gap-2 text-xs text-body">
            <span>{car.manufacturingYear}</span>
            <span className="text-body/30">•</span>
            <span>{car.fuelType}</span>
            <span className="text-body/30">•</span>
            <span>{car.transmission}</span>
          </div>

          {/* Buttons - Larger touch targets, NO Eye icon */}
          <div className="btn-group flex gap-2 mt-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                aria-label="Call seller"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-3 rounded-xl transition-colors duration-200 text-xs"
              >
                <Phone size={14} />
                Call
              </a>
            )}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.brand} ${car.model}`)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Contact on WhatsApp"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-3 rounded-xl transition-colors duration-200 text-xs"
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>
            )}

            <Link
              to={`/cars/${car.slug}`}
              className="flex-1 text-center bg-gray-900 dark:bg-emerald hover:bg-gray-800 dark:hover:bg-emerald-dark text-white font-medium py-2.5 px-3 rounded-xl transition-colors duration-200 text-xs"
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.div>

      <QuickViewModal car={quickViewOpen ? car : null} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}

export default memo(CarCard);