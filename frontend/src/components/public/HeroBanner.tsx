// HeroBanner.tsx - Complete with premium right-side image slider
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  BadgeCheck, 
  CarFront, 
  Handshake, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { memo, useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================
const FEATURES = [
  { label: 'Certified Cars', icon: ShieldCheck },
  { label: 'Loan Facility', icon: Handshake },
  { label: 'RC Transfer', icon: BadgeCheck },
  { label: 'Best Price', icon: CarFront },
];

const SLIDER_IMAGES = [
  '/images/banner2.jpeg',
  '/images/banner3.jpeg',
  '/images/banner4.png',
  '/images/banner5.png',
  '/images/banner6.jpeg',
];

// ============================================
// OPTIMIZED IMAGE COMPONENT
// ============================================
const HeroImage = memo(({ 
  src, 
  srcWebp, 
  alt, 
  className = '',
  fallback = '/images/banner1.jpeg',
  priority = false
}: { 
  src: string;
  srcWebp?: string;
  alt: string;
  className?: string;
  fallback?: string;
  priority?: boolean;
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageSrc = error ? fallback : src;

  return (
    <picture>
      {srcWebp && !error && <source srcSet={srcWebp} type="image/webp" />}
      <img
        src={imageSrc}
        alt={alt}
        width="1920"
        height="1080"
        className={`${className} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        draggable={false}
      />
    </picture>
  );
});

HeroImage.displayName = 'HeroImage';

// ============================================
// PREMIUM RIGHT SIDE IMAGE SLIDER
// ============================================
const HeroImageSlider = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());

  const totalSlides = SLIDER_IMAGES.length;

  useEffect(() => {
    SLIDER_IMAGES.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setPreloadedImages(prev => new Set(prev).add(index));
      };
      img.onerror = () => {
        setPreloadedImages(prev => new Set(prev).add(index));
      };
    });
  }, []);

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % totalSlides;
    const img = new Image();
    img.src = SLIDER_IMAGES[nextIndex];
  }, [currentIndex, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    const newIndex = ((index % totalSlides) + totalSlides) % totalSlides;
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  }, [currentIndex, totalSlides]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const previousSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (!isPaused) {
      intervalRef.current = setInterval(nextSlide, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, nextSlide, prefersReducedMotion]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      setIsPaused(false);
      return;
    }

    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => setIsPaused(false), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 3000);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousSlide, nextSlide]);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.05 }}
      className="relative w-full max-w-sm mx-auto lg:max-w-[30rem] xl:max-w-[35rem] 2xl:max-w-[40rem] lg:mx-0 lg:justify-self-end"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Luxury vehicle showcase slider"
    >
      <div className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-r from-[#F4B400]/0 via-[#F4B400]/0 to-[#F4B400]/0 group-hover:from-[#F4B400]/20 group-hover:via-[#F4B400]/30 group-hover:to-[#F4B400]/20 blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100" />
      
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] border border-white/12 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-sm group">
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={prefersReducedMotion ? { opacity: 1 } : { 
              opacity: 0,
              scale: 1.08,
              x: direction > 0 ? 40 : -40
            }}
            animate={prefersReducedMotion ? { opacity: 1 } : { 
              opacity: 1,
              scale: 1,
              x: 0,
              transition: { 
                duration: 1.2, 
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            exit={prefersReducedMotion ? { opacity: 1 } : { 
              opacity: 0,
              scale: 0.95,
              x: direction > 0 ? -40 : 40,
              transition: { 
                duration: 0.8, 
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            className="relative aspect-[4/3] overflow-hidden rounded-[20px] sm:rounded-[24px] lg:rounded-[28px]"
          >
            <HeroImage
              src={SLIDER_IMAGES[currentIndex]}
              srcWebp={SLIDER_IMAGES[currentIndex]}
              alt={`Premium vehicle showcase ${currentIndex + 1}`}
              className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
              fallback="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop"
              priority={currentIndex === 0}
            />
            
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"
              aria-hidden="true"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: 'linear',
                repeatDelay: 2
              }}
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-[-20deg]" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousSlide();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
            className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 hover:border-[#F4B400]/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 opacity-70 hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} className="text-white sm:size-[20px]" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
            className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 hover:border-[#F4B400]/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 opacity-70 hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={16} className="text-white sm:size-[20px]" />
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
          {SLIDER_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 3000);
              }}
              className={`pointer-events-auto transition-all duration-500 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 ${
                index === currentIndex
                  ? 'w-4 sm:w-5 h-1.5 bg-[#F4B400] shadow-[0_0_12px_rgba(244,180,0,0.4)]'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <motion.div
          animate={prefersReducedMotion ? { y: 0 } : { y: [0, -6, 0] }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 left-2 right-2 sm:left-3 sm:right-3 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] border border-white/10 bg-white/95 p-2 sm:p-2.5 lg:p-3 xl:p-3.5 shadow-lg lg:left-auto lg:bottom-3 lg:w-[18rem] xl:w-[20rem] 2xl:w-[22rem] pointer-events-none"
          role="complementary"
          aria-label="Luxury inventory promotion"
        >
          <div className="flex items-center gap-2 sm:gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400]">
                Luxury Inventory
              </p>
              <p className="mt-0.5 text-[10px] sm:text-xs lg:text-sm xl:text-base font-bold text-gray-900 truncate">
                Premium cars with verified history
              </p>
            </div>
            <div 
              className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 xl:h-10 xl:w-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]"
              aria-hidden="true"
            >
              <CarFront size={14} className="sm:size-[16px] lg:size-[18px] xl:size-[20px]" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

HeroImageSlider.displayName = 'HeroImageSlider';

// ============================================
// MAIN HERO BANNER
// ============================================
const HeroBanner = memo(function HeroBanner() {
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToCars = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('car-listings');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-black text-white"
      style={{ 
        minHeight: '55vh',
        height: 'auto',
        maxHeight: '100vh'
      }}
      aria-label="Hero banner showcasing premium used cars"
    >
      <div className="absolute inset-0">
        <HeroImage
          src="/images/banner1.jpeg"
          srcWebp="/images/banner1.jpeg"
          alt="Balaji Cars dealership showroom with premium vehicles on display"
          className="h-full w-full object-cover object-center opacity-75"
          fallback="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop"
          priority={true}
        />
        
        <div 
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.78)_0%,rgba(0,0,0,.48)_50%,rgba(0,0,0,.72)_100%)]"
          aria-hidden="true"
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,180,0,.08),transparent_30%)]"
          aria-hidden="true"
        />
        
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
          aria-hidden="true"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 h-full flex items-center py-8 sm:py-12 lg:py-0">
        <div className="w-full grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 xl:gap-12">
          
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-[690px] text-center lg:text-left"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F4B400]/20 to-[#F4B400]/5 border border-[#F4B400]/20 px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-1.5 mb-2"
            >
              <Sparkles size={12} className="text-[#F4B400] sm:size-[14px]" />
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-[#F4B400] tracking-wide">PREMIUM SELECTION</span>
            </motion.div>

            <motion.p 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-[#F4B400]"
            >
              TRUSTED USED CAR DEALERSHIP
            </motion.p>
            
            <motion.h1 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-1 sm:mt-1.5 lg:mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-[-0.04em] text-white"
            >
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F4B400] to-[#F59E0B]">
                Pre-Owned Car
              </span>
            </motion.h1>
            
            <motion.p 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-2 sm:mt-3 max-w-[620px] text-sm sm:text-base lg:text-lg leading-relaxed text-white/80 mx-auto lg:mx-0"
            >
              Explore certified used cars with transparent pricing, verified quality, and flexible loan options.
            </motion.p>

            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/88"
              role="list"
            >
              {FEATURES.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-[#F4B400]/30 active:scale-95"
                  role="listitem"
                >
                  <Icon size={12} className="text-[#F4B400] flex-shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{label}</span>
                </span>
              ))}
            </motion.div>

            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-4 sm:mt-5 lg:mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <Link
                to="#car-listings"
                onClick={handleScrollToCars}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-6 py-3 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(244,180,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(244,180,0,.35)] active:scale-[0.98]"
                aria-label="Browse our inventory of premium used cars"
              >
                <span>Browse Cars</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:-translate-y-1 active:scale-[0.98]"
                aria-label="Contact Balaji Cars dealership"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>

          <HeroImageSlider />
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:block"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-0.5 text-white/40 text-[8px] sm:text-[10px] uppercase tracking-widest">
          <span>Scroll</span>
          <ArrowRight size={10} className="rotate-90 sm:size-[12px]" />
        </div>
      </motion.div>
    </section>
  );
});

export default HeroBanner;