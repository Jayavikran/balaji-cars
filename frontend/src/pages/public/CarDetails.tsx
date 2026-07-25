import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle, Phone, Instagram, Heart, Share2, GitCompare,
  Calendar, Gauge, User as UserIcon, Fuel, Settings2, MapPin, ShieldCheck, ChevronLeft, ChevronRight,
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

// recharts (used only by the EMI chart) is ~150KB — lazy-load it so it
// doesn't bloat the bundle for every page on the site.
const EMICalculator = lazy(() => import('@/components/public/EMICalculator'));

function formatPrice(price: number) {
  return `₹${(price / 100000).toFixed(2)} Lakh`;
}

function isNewArrival(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 14;
}

export default function CarDetails() {
  const { idOrSlug = '' } = useParams();
  const [imgIndex, setImgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();

  const { data: settings } = useSiteSettings();
  const { data: car, isLoading } = useQuery({
    queryKey: ['car', idOrSlug],
    queryFn: () => fetchCarByIdOrSlug(idOrSlug),
  });

  // The component stays mounted when navigating between two car detail
  // pages (only the :idOrSlug param changes), so local UI state like the
  // gallery position needs an explicit reset per car.
  useEffect(() => {
    setImgIndex(0);
  }, [idOrSlug]);

  if (isLoading || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-line border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  const images = car.images?.length ? car.images : [{ url: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=1200&auto=format&fit=crop' }];
  const whatsapp = car.whatsappNumber || settings?.whatsappNumber;
  const phone = car.phoneNumber || settings?.phoneNumber;
  const instagram = car.instagramUrl || settings?.instagramUrl;
  const fav = isFavorite(car._id);

  const siteName = settings?.companyName || 'BALAJI CARS';
  const carName = `${car.brand} ${car.model}${car.variant ? ` ${car.variant}` : ''}`;
  const seoTitle = `${carName} (${car.manufacturingYear}) for ₹${(car.price / 100000).toFixed(2)} Lakh | ${siteName}`;
  const seoDescription = (
    car.description
      ? car.description.slice(0, 155)
      : `${carName} — ${car.manufacturingYear}, ${car.kilometersDriven.toLocaleString('en-IN')} km driven, ${car.fuelType} ${car.transmission}. Priced at ₹${(car.price / 100000).toFixed(2)} Lakh. Available at ${siteName}.`
  );
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: car.brand, href: `/?brand=${encodeURIComponent(car.brand)}` },
    { label: `${car.model}${car.variant ? ` ${car.variant}` : ''}` },
  ];

  const vehicleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: carName,
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.manufacturingYear),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.kilometersDriven,
      unitCode: 'KMT',
    },
    fuelType: car.fuelType,
    vehicleTransmission: car.transmission,
    image: images.map((img) => img.url),
    description: seoDescription,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'INR',
      availability: car.status === 'Available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteOrigin}/cars/${car.slug}`,
    },
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: `${car.manufacturingYear} (Reg. ${car.registrationYear})` },
    { icon: Gauge, label: 'Driven', value: `${car.kilometersDriven.toLocaleString('en-IN')} km` },
    { icon: UserIcon, label: 'Owner', value: car.owner },
    { icon: Fuel, label: 'Fuel', value: car.fuelType },
    { icon: Settings2, label: 'Transmission', value: car.transmission },
    { icon: MapPin, label: 'Location', value: car.location },
  ];

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setImgIndex((i) => (i + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={seoTitle}
        description={seoDescription}
        image={images[0]?.url}
        type="product"
        jsonLd={[vehicleJsonLd, getBreadcrumbJsonLd(breadcrumbItems, siteOrigin)]}
      />
      <Header settings={settings} search="" onSearchChange={() => {}} sort="newest" onSortChange={() => {}} onOpenFilters={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-50" style={{ height: 'min(600px, 70vh)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={imgIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <img
                  src={optimizeImage(images[imgIndex].url, 1200)}
                  alt={`${car.brand} ${car.model} - Image ${imgIndex + 1}`}
                  loading="lazy"
                  className="w-full h-full object-contain"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="text-gray-800" />
                </button>
              </>
            )}

            <div className="absolute top-4 left-4 flex gap-1.5 z-10">
              {car.isFeatured && <span className="badge badge-featured">Featured</span>}
              {isNewArrival(car.createdAt) && <span className="badge badge-new">New Arrival</span>}
              {car.previousPrice && car.previousPrice > car.price && <span className="badge badge-price-drop">Price Dropped</span>}
              <span className={`badge ${car.status === 'Available' ? 'badge-available' : car.status === 'Reserved' ? 'badge-reserved' : 'badge-sold'}`}>
                {car.status}
              </span>
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (isTransitioning || index === imgIndex) return;
                      setIsTransitioning(true);
                      setImgIndex(index);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === imgIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {imgIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (isTransitioning || i === imgIndex) return;
                    setIsTransitioning(true);
                    setImgIndex(i);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }}
                  className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                    i === imgIndex ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={optimizeImage(img.url, 150)}
                    alt={`${car.brand} ${car.model} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {i === imgIndex && (
                    <div className="absolute inset-0 bg-blue-600/10" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Title & actions */}
          <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">{car.brand} {car.model} {car.variant}</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="price-tag text-2xl">{formatPrice(car.price)}</p>
                {car.previousPrice && car.previousPrice > car.price && (
                  <p className="text-sm text-body line-through">{formatPrice(car.previousPrice)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleFavorite(car)} 
                aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                aria-pressed={fav}
                className="w-10 h-10 rounded-full border border-line dark:border-white/15 flex items-center justify-center hover:border-red-400 transition-colors"
              >
                <Heart size={17} className={fav ? 'fill-red-500 text-red-500' : 'text-ink dark:text-white/80'} />
              </button>
              <button
                onClick={() => {
                  const result = toggleCompare(car);
                  if (result === 'full') toast.error('You can compare up to 3 cars at a time.');
                  else if (result === 'added') toast.success('Added to compare.');
                  else toast('Removed from compare.');
                }}
                aria-label={isComparing(car._id) ? 'Remove from compare' : 'Add to compare'}
                aria-pressed={isComparing(car._id)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                  isComparing(car._id)
                    ? 'bg-navy border-navy text-white dark:bg-emerald dark:border-emerald'
                    : 'border-line dark:border-white/15 text-ink dark:text-white/80 hover:border-navy dark:hover:border-white/40'
                }`}
              >
                <GitCompare size={17} />
              </button>
              <button
                onClick={() => navigator.share?.({ title: `${car.brand} ${car.model}`, url: window.location.href })}
                aria-label="Share this car"
                className="w-10 h-10 rounded-full border border-line dark:border-white/15 flex items-center justify-center hover:border-navy transition-colors text-ink dark:text-white/80"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Spec strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specs.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 bg-surface dark:bg-white/5 rounded-2xl px-3.5 py-3">
                <s.icon size={17} className="text-navy dark:text-emerald shrink-0" />
                <div>
                  <p className="text-[11px] text-body uppercase tracking-wide">{s.label}</p>
                  <p className="text-sm font-medium text-ink dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {car.insuranceActive && <span className="badge badge-insurance"><ShieldCheck size={12} /> Insurance Active</span>}
            {car.fcValid && <span className="badge bg-emerald/10 text-emerald-dark">FC Valid</span>}
            <span className="badge bg-surface text-body">RC {car.rcStatus}</span>
          </div>

          {car.description && (
            <div className="mt-6">
              <h3 className="font-display font-semibold text-ink dark:text-white mb-2">Description</h3>
              <p className="text-sm text-body leading-relaxed">{car.description}</p>
            </div>
          )}

          {car.features?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display font-semibold text-ink dark:text-white mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((f) => (
                  <span key={f} className="badge bg-surface dark:bg-white/5 text-ink dark:text-white/80 border border-line dark:border-white/10">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: contact actions + enquiry form + EMI calculator */}
        <div className="space-y-4">
          <div className="surface-card rounded-card p-5 space-y-3">
            <h4 className="font-display font-semibold text-ink dark:text-white">Contact Dealer</h4>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.brand} ${car.model}`)}`} target="_blank" rel="noreferrer" className="btn-primary w-full bg-emerald hover:bg-emerald-dark">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="btn-outline w-full">
                <Phone size={16} /> Call Now
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer" className="btn-outline w-full">
                <Instagram size={16} /> View on Instagram
              </a>
            )}
          </div>

          <Suspense fallback={<div className="surface-card rounded-card h-[340px] animate-pulse" />}>
            <EMICalculator carPrice={car.price} />
          </Suspense>

          <EnquiryForm carId={car._id} />
          <Link to="/" className="text-sm text-body hover:text-navy dark:hover:text-white inline-block">← Back to all cars</Link>
        </div>
      </div>

      <SimilarCars car={car} />
      <Footer settings={settings} />
      <FloatingContacts settings={settings} />
    </div>
  );
}