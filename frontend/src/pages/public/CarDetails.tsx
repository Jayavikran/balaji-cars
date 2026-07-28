import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const EMICalculator = lazy(() => import('@/components/public/EMICalculator'));

function formatPrice(price: number) {
  return `Rs ${(price / 100000).toFixed(2)} Lakh`;
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

  useEffect(() => {
    setImgIndex(0);
  }, [idOrSlug]);

  if (isLoading || !car) {
    return (
      <div className="mobile-page min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-[#F4B400]" />
      </div>
    );
  }

  const images = car.images?.length ? car.images : [{ url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop' }];
  const whatsapp = car.whatsappNumber || settings?.whatsappNumber;
  const phone = car.phoneNumber || settings?.phoneNumber;
  const instagram = car.instagramUrl || settings?.instagramUrl;
  const fav = isFavorite(car._id);

  const siteName = settings?.companyName || 'BALAJI CARS';
  const carName = `${car.brand} ${car.model}${car.variant ? ` ${car.variant}` : ''}`;
  const seoTitle = `${carName} (${car.manufacturingYear}) for Rs ${(car.price / 100000).toFixed(2)} Lakh | ${siteName}`;
  const seoDescription = car.description
    ? car.description.slice(0, 155)
    : `${carName} - ${car.manufacturingYear}, ${car.kilometersDriven.toLocaleString('en-IN')} km driven, ${car.fuelType} ${car.transmission}. Priced at Rs ${(car.price / 100000).toFixed(2)} Lakh. Available at ${siteName}.`;
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

  const statusTone =
    car.status === 'Available'
      ? 'bg-emerald/10 text-emerald-dark border-emerald/20'
      : car.status === 'Reserved'
        ? 'bg-amber/10 text-[#8A5A00] border-amber/20'
        : 'bg-red-50 text-red-600 border-red-100';

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-[#F8F8F8]">
      <Seo
        title={seoTitle}
        description={seoDescription}
        image={images[0]?.url}
        type="product"
        jsonLd={[vehicleJsonLd, getBreadcrumbJsonLd(breadcrumbItems, siteOrigin)]}
      />
      <Header settings={settings} showSearchBar={false} />

      <div className="premium-shell py-4 sm:py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <main className="premium-shell flex-1 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[28px] bg-black shadow-[0_18px_60px_rgba(0,0,0,.18)]">
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
                    src={optimizeImage(images[imgIndex].url, 1600)}
                    alt={`${car.brand} ${car.model} - Image ${imgIndex + 1}`}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.58),rgba(0,0,0,.12)_45%,transparent)]" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {car.isFeatured && <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm">Featured</span>}
                {isNewArrival(car.createdAt) && <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm">New Arrival</span>}
                {car.previousPrice && car.previousPrice > car.price && <span className="rounded-full bg-[#F4B400] px-3 py-1 text-[11px] font-semibold text-black shadow-sm">Price Dropped</span>}
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${statusTone}`}>
                  {car.status}
                </span>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/85 text-ink shadow-card transition-transform hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/85 text-ink shadow-card transition-transform hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-white backdrop-blur-md">
                <span className="text-xs font-semibold">{imgIndex + 1} / {images.length}</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isTransitioning || i === imgIndex) return;
                      setIsTransitioning(true);
                      setImgIndex(i);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition-all duration-200 ${
                      i === imgIndex ? 'border-[#F4B400] shadow-card' : 'border-line hover:border-[#F4B400]/60'
                    }`}
                  >
                    <img
                      src={optimizeImage(img.url, 240)}
                      alt={`${car.brand} ${car.model} thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-[28px] border border-line bg-white p-5 sm:p-6 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Available Vehicle</p>
                  <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink sm:text-4xl">
                    {car.brand} {car.model} {car.variant}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-body sm:text-base">
                    {car.description || 'A premium verified used car with a clean presentation, trusted paperwork, and dealer support for a confident purchase.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(car)}
                    aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                    aria-pressed={fav}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors hover:border-[#F4B400]"
                  >
                    <Heart size={17} className={fav ? 'fill-red-500 text-red-500' : 'text-ink'} />
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
                    className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-colors ${
                      isComparing(car._id) ? 'border-[#F4B400] bg-[#F4B400] text-black' : 'border-line bg-white text-ink hover:border-[#F4B400]'
                    }`}
                  >
                    <GitCompare size={17} />
                  </button>
                  <button
                    onClick={() => navigator.share?.({ title: `${car.brand} ${car.model}`, url: window.location.href })}
                    aria-label="Share this car"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors hover:border-[#F4B400]"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-body">Price</p>
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-3xl font-extrabold text-[#F4B400]">{formatPrice(car.price)}</p>
                    {car.previousPrice && car.previousPrice > car.price && (
                      <p className="text-sm text-body line-through">{formatPrice(car.previousPrice)}</p>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-body">Loan support available</span>
                <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-body">RC transfer assistance</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="rounded-[22px] border border-line bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                      <s.icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-body">{s.label}</p>
                      <p className="truncate text-sm font-semibold text-ink">{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {car.insuranceActive && <span className="badge badge-insurance"><ShieldCheck size={12} /> Insurance Active</span>}
              {car.fcValid && <span className="badge bg-emerald/10 text-emerald-dark">FC Valid</span>}
              <span className="badge bg-surface text-body">RC {car.rcStatus}</span>
            </div>

            {car.features?.length > 0 && (
              <div className="mt-6 rounded-[28px] border border-line bg-white p-5 shadow-card">
                <h3 className="text-lg font-bold text-ink">Features</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {car.features.map((f) => (
                    <span key={f} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {car.description && (
              <div className="mt-6 rounded-[28px] border border-line bg-white p-5 shadow-card">
                <h3 className="text-lg font-bold text-ink">Description</h3>
                <p className="mt-3 text-sm leading-7 text-body">{car.description}</p>
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[28px] border border-line bg-[#0F0F10] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Contact Dealer</p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Reach out directly for a viewing, finance support, or more photos of this car.
              </p>

              <div className="mt-5 space-y-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.brand} ${car.model}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F4B400] px-5 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01]"
                  >
                    <MessageCircle size={16} /> Chat on WhatsApp
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Phone size={16} /> Call Now
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Instagram size={16} /> View on Instagram
                  </a>
                )}
              </div>
            </div>

            <Suspense fallback={<div className="rounded-[28px] border border-line bg-white h-[340px] animate-pulse shadow-card" />}>
              <EMICalculator carPrice={car.price} />
            </Suspense>

            <EnquiryForm carId={car._id} />

            <div className="rounded-[22px] border border-line bg-white p-4 text-center shadow-sm">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-body transition-colors hover:text-[#F4B400]">
                <ArrowRight size={15} className="rotate-180" />
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
