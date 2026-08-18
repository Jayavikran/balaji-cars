import { useEffect, useState, lazy, Suspense, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle,
  Phone,
  Instagram,
  Heart,
  Share2,
  GitCompare,
  Calendar,
  Gauge,
  User as UserIcon,
  Fuel,
  Settings2,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Maximize2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchCarByIdOrSlug } from '@/api/cars';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import FloatingContacts from '@/components/public/FloatingContacts';
import SimilarCars from '@/components/public/SimilarCars';
import EnquiryForm from '@/components/public/EnquiryForm';
import { useFavorites } from '@/hooks/useFavorites';
import { useCompare } from '@/hooks/useCompare';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Seo from '@/components/shared/Seo';
import Breadcrumbs, { getBreadcrumbJsonLd } from '@/components/shared/Breadcrumbs';
import { optimizeImage } from '@/utils/optimizeImage';
import { buildCarBreadcrumbItems, buildCarProductSchema, buildCarSeoDescription, buildCarSeoTitle, getSiteOrigin, resolveAbsoluteUrl, SITE_NAME } from '@/utils/seo';

const EMICalculator = lazy(() => import('@/components/public/EMICalculator'));

const MAX_COMPARE_LIMIT = 3;

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Crore`;
  return `₹${(price / 100000).toFixed(2)} Lakh`;
}

function isNewArrival(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 14;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30';
    case 'Reserved':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
    case 'Sold':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

const CarDetailsSkeleton = function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-black">
      <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-6">
        <div className="h-5 sm:h-6 w-36 sm:w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="container mx-auto px-4 pb-6 sm:pb-10 sm:px-6 sm:pb-14">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          <div className="min-w-0">
            <div className="aspect-[4/3] sm:aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-2xl sm:rounded-[28px] animate-pulse" />
            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl sm:rounded-[22px] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-[250px] sm:h-[300px] bg-gray-200 dark:bg-gray-700 rounded-2xl sm:rounded-[28px] animate-pulse" />
            <div className="h-[180px] sm:h-[200px] bg-gray-200 dark:bg-gray-700 rounded-2xl sm:rounded-[28px] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageLightbox = function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: { url: string; alt?: string }[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={onClose}
        className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close lightbox"
      >
        <X size={20} className="sm:size-[24px]" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft size={20} className="sm:size-[24px]" />
      </button>

      <img
        src={optimizeImage(images[currentIndex]?.url, 1600)}
        alt={images[currentIndex]?.alt || `Image ${currentIndex + 1}`}
        className="max-h-[85vh] sm:max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Next image"
      >
        <ChevronRight size={20} className="sm:size-[24px]" />
      </button>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/50 text-white text-xs sm:text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
};

export default function CarDetails() {
  const { idOrSlug = '' } = useParams();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();
  const galleryRef = useRef<HTMLDivElement>(null);

  const { data: settings } = useSiteSettings();
  const { data: car, isLoading, error } = useQuery({
    queryKey: ['car', idOrSlug],
    queryFn: () => fetchCarByIdOrSlug(idOrSlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setImgIndex(0);
  }, [idOrSlug]);

  useEffect(() => {
    if (car?.slug && idOrSlug !== car.slug) {
      navigate(`/cars/${car.slug}`, { replace: true });
    }
  }, [car?.slug, idOrSlug, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const images = car?.images?.length ? car.images : [{ url: '/images/placeholder-car.jpg' }];

  const nextImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setImgIndex((i) => (i + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, images.length]);

  const prevImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, images.length]);

  const handleToggleFavorite = useCallback(() => {
    if (!car) return;
    toggleFavorite(car);
    toast.success(isFavorite(car._id) ? 'Removed from favorites' : 'Added to favorites');
  }, [car, toggleFavorite, isFavorite]);

  const handleToggleCompare = useCallback(() => {
    if (!car) return;
    const result = toggleCompare(car);
    if (result === 'full') {
      toast.error(`You can compare up to ${MAX_COMPARE_LIMIT} cars at a time.`);
    } else if (result === 'added') {
      toast.success('Added to compare list');
    } else {
      toast.success('Removed from compare list');
    }
  }, [car, toggleCompare]);

  const handleShare = useCallback(() => {
    if (navigator.share && car) {
      navigator.share({
        title: `${car.brand} ${car.model} ${car.variant || ''}`,
        text: `Check out this ${car.brand} ${car.model} at ${formatPrice(car.price)}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (car) {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        toast.success('Link copied to clipboard');
      });
    }
  }, [car]);

  if (isLoading) return <CarDetailsSkeleton />;

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] dark:bg-black px-4">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white dark:bg-surface-dark rounded-2xl shadow-card">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3 sm:mb-4 sm:size-[48px]" />
          <h2 className="text-lg sm:text-xl font-bold text-ink dark:text-white mb-2">Car Not Found</h2>
          <p className="text-sm sm:text-base text-body dark:text-white/60 mb-4 sm:mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#F4B400] text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#f7c233] transition-colors text-sm sm:text-base">
            Browse Cars <ArrowRight size={14} className="sm:size-[16px]" />
          </Link>
        </div>
      </div>
    );
  }

  const carName = `${car.brand} ${car.model}${car.variant ? ` ${car.variant}` : ''}`;
  const seoTitle = buildCarSeoTitle(car);
  const seoDescription = buildCarSeoDescription(car);
  const siteOrigin = getSiteOrigin();
  const siteName = settings?.companyName || SITE_NAME;
  const fav = isFavorite(car._id);
  const comparing = isComparing(car._id);
  const isNew = isNewArrival(car.createdAt);
  const hasPriceDrop = car.previousPrice && car.previousPrice > car.price;
  const statusColor = getStatusColor(car.status);

  const breadcrumbItems = buildCarBreadcrumbItems(car);
  const productJsonLd = buildCarProductSchema(car, siteOrigin, siteName);

  const specs = [
    { icon: Calendar, label: 'Year', value: `${car.manufacturingYear} (Reg. ${car.registrationYear})` },
    { icon: Gauge, label: 'Driven', value: `${(car.kilometersDriven || 0).toLocaleString('en-IN')} km` },
    { icon: UserIcon, label: 'Owner', value: car.owner || '—' },
    { icon: Fuel, label: 'Fuel', value: car.fuelType || '—' },
    { icon: Settings2, label: 'Transmission', value: car.transmission || '—' },
    { icon: MapPin, label: 'Location', value: car.location || '—' },
  ];

  const whatsapp = car.whatsappNumber || settings?.whatsappNumber;
  const phone = car.phoneNumber || settings?.phoneNumber;
  const instagram = car.instagramUrl || settings?.instagramUrl;

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-[#F8F8F8] dark:bg-black">
      <Seo
        title={seoTitle}
        description={seoDescription}
        image={resolveAbsoluteUrl(images[0]?.url, siteOrigin)}
        type="product"
        canonical={`/cars/${car.slug}`}
        noindex={car.status === 'Sold'}
        jsonLd={[productJsonLd, getBreadcrumbJsonLd(breadcrumbItems, siteOrigin)]}
      />
      <Header settings={settings} showSearchBar={false} />

      <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <main className="container mx-auto px-4 pb-6 sm:pb-10 sm:px-6 sm:pb-14 flex-1">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          {/* Left Column */}
          <div className="min-w-0">
            {/* Main Image */}
            <div 
              ref={galleryRef}
              className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-black shadow-[0_18px_60px_rgba(0,0,0,.18)]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={imgIndex}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="relative aspect-[4/3] sm:aspect-[16/10]"
                >
                  <img
                    src={optimizeImage(images[imgIndex]?.url, 800)}
                    alt={`${carName} - Image ${imgIndex + 1}`}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.58),rgba(0,0,0,.12)_45%,transparent)]" />
                  
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Zoom image"
                  >
                    <Maximize2 size={14} className="sm:size-[16px]" />
                  </button>
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute left-3 sm:left-4 top-3 sm:top-4 flex flex-wrap gap-1.5 sm:gap-2">
                {car.isFeatured && (
                  <span className="rounded-full bg-white/92 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-ink shadow-sm">
                    ⭐ Featured
                  </span>
                )}
                {isNew && (
                  <span className="rounded-full bg-blue-50/92 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-blue-700 shadow-sm border border-blue-200/50">
                    New Arrival
                  </span>
                )}
                {hasPriceDrop && (
                  <span className="rounded-full bg-[#F4B400]/92 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-black shadow-sm">
                    🔥 Price Dropped
                  </span>
                )}
                <span className={`rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold backdrop-blur-sm shadow-sm ${statusColor}`}>
                  {car.status}
                </span>
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/85 text-ink shadow-card transition-all hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} className="sm:size-[20px]" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/85 text-ink shadow-card transition-all hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} className="sm:size-[20px]" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 sm:px-4 py-1 sm:py-2 text-white backdrop-blur-md">
                <span className="text-[10px] sm:text-xs font-semibold">{imgIndex + 1} / {images.length}</span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isTransitioning || i === imgIndex) return;
                      setIsTransitioning(true);
                      setImgIndex(i);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                    className={`relative h-14 w-20 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                      i === imgIndex 
                        ? 'border-[#F4B400] shadow-card' 
                        : 'border-line hover:border-[#F4B400]/60'
                    }`}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === imgIndex ? 'true' : 'false'}
                  >
                    <img
                      src={optimizeImage(img.url, 200)}
                      alt={`${carName} thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Lightbox */}
            <AnimatePresence>
              {isLightboxOpen && (
                <ImageLightbox
                  images={images}
                  currentIndex={imgIndex}
                  onClose={() => setIsLightboxOpen(false)}
                  onNext={nextImage}
                  onPrev={prevImage}
                />
              )}
            </AnimatePresence>

            {/* Car Details Card */}
            <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-[28px] border border-line bg-white p-4 sm:p-5 shadow-card sm:p-6 dark:bg-white/5 dark:border-white/10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">
                    Available Vehicle
                  </p>
                  <h1 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-extrabold leading-tight text-ink sm:text-4xl dark:text-white">
                    {carName}
                  </h1>
                  <p className="mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 text-body sm:text-base dark:text-white/70">
                    {car.description || 'A premium verified used car with a clean presentation, trusted paperwork, and dealer support for a confident purchase.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="toolbar" aria-label="Car actions">
                  <button
                    onClick={handleToggleFavorite}
                    aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                    aria-pressed={fav}
                    className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 ${
                      fav 
                        ? 'border-red-300 bg-red-50 text-red-500 dark:border-red-800/30 dark:bg-red-900/20' 
                        : 'border-line bg-white text-ink hover:border-[#F4B400] dark:border-white/10 dark:bg-white/5 dark:text-white'
                    }`}
                  >
                    <Heart size={15} className={fav ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                  
                  <button
                    onClick={handleToggleCompare}
                    aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
                    aria-pressed={comparing}
                    className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 ${
                      comparing 
                        ? 'border-[#F4B400] bg-[#F4B400] text-black' 
                        : 'border-line bg-white text-ink hover:border-[#F4B400] dark:border-white/10 dark:bg-white/5 dark:text-white'
                    }`}
                  >
                    <GitCompare size={15} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    aria-label="Share this car"
                    className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-all hover:border-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Price Section */}
              <div className="mt-4 sm:mt-5 flex flex-wrap items-end gap-2 sm:gap-3">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-body dark:text-white/50">Price</p>
                  <div className="mt-1 flex items-center gap-2 sm:gap-3">
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#F4B400]">{formatPrice(car.price)}</p>
                    {hasPriceDrop && (
                      <p className="text-xs sm:text-sm text-body line-through dark:text-white/40">
                        {formatPrice(car.previousPrice!)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-surface px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-body dark:bg-white/5 dark:text-white/60">
                  Loan support available
                </span>
                <span className="rounded-full bg-surface px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-body dark:bg-white/5 dark:text-white/60">
                  RC transfer assistance
                </span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="rounded-2xl sm:rounded-[22px] border border-line bg-white p-3 sm:p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                      <s.icon size={15} className="sm:size-[17px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-body dark:text-white/50">{s.label}</p>
                      <p className="truncate text-xs sm:text-sm font-semibold text-ink dark:text-white">{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Badges */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
              {car.insuranceActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <ShieldCheck size={11} className="sm:size-[12px]" /> Insurance Active
                </span>
              )}
              {car.fcValid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 size={11} className="sm:size-[12px]" /> FC Valid
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-body dark:bg-white/5 dark:text-white/60">
                RC {car.rcStatus || 'Clear'}
              </span>
            </div>

            {/* Features */}
            {car.features?.length > 0 && (
              <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-[28px] border border-line bg-white p-4 sm:p-5 shadow-card dark:border-white/10 dark:bg-white/5">
                <h3 className="text-base sm:text-lg font-bold text-ink dark:text-white">Features</h3>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                  {car.features.map((f) => (
                    <span key={f} className="rounded-full border border-line bg-surface px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-ink dark:border-white/10 dark:bg-white/5 dark:text-white">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-[28px] border border-line bg-white p-4 sm:p-5 shadow-card dark:border-white/10 dark:bg-white/5">
                <h3 className="text-base sm:text-lg font-bold text-ink dark:text-white">Description</h3>
                <p className="mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 text-body dark:text-white/70">{car.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-4 sm:space-y-4 xl:sticky xl:top-28 xl:self-start">
            {/* Contact Card */}
            <div className="rounded-2xl sm:rounded-[28px] border border-line bg-[#0F0F10] p-4 sm:p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,.18)] dark:bg-black dark:border-white/10">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Contact Dealer</p>
              <p className="mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 text-white/75">
                Reach out directly for a viewing, finance support, or more photos of this car.
              </p>

              <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.brand} ${car.model}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F4B400] px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={`Chat on WhatsApp about ${carName}`}
                  >
                    <MessageCircle size={15} aria-hidden="true" /> Chat on WhatsApp
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={`Call about ${carName}`}
                  >
                    <Phone size={15} aria-hidden="true" /> Call Now
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={`View ${carName} on Instagram`}
                  >
                    <Instagram size={15} aria-hidden="true" /> View on Instagram
                  </a>
                )}
              </div>
            </div>

            {/* EMI Calculator */}
            <Suspense fallback={
              <div className="rounded-2xl sm:rounded-[28px] border border-line bg-white h-[280px] sm:h-[340px] animate-pulse shadow-card dark:border-white/10 dark:bg-white/5" />
            }>
              <EMICalculator carPrice={car.price} />
            </Suspense>

            {/* Enquiry Form */}
            <EnquiryForm carId={car._id} />

            {/* Back Link */}
            <div className="rounded-2xl sm:rounded-[22px] border border-line bg-white p-3 sm:p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-body transition-colors hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded-full px-2 sm:px-3 py-1"
              >
                <ArrowRight size={14} className="rotate-180" aria-hidden="true" />
                Back to all cars
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SimilarCars car={car} />
      <Footer settings={settings} />
      <FloatingContacts settings={settings} />
    </div>
  );
}
