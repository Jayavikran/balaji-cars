// HeroBanner.tsx - Premium Production 3D Animated Automotive Experience
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  '/images/banner5.jpeg',
  '/images/banner6.jpeg',
];

// ============================================
// LIGHTWEIGHT 3D AMBIENT CANVAS ENGINE
// ============================================
const Automotive3DCanvas = memo(({ isMobile, reducedMotion }: { isMobile: boolean; reducedMotion: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isMobile || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic 3D ambient particles
    const count = 40;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1000,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.35 + 0.1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.35 - 0.1,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Ambient radial light pool following cursor
      const glowGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, Math.max(width, height) * 0.5);
      glowGrad.addColorStop(0, 'rgba(244, 180, 0, 0.07)');
      glowGrad.addColorStop(0.4, 'rgba(30, 58, 138, 0.03)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw floating particles with 3D parallax depth
      const offsetX = (mouseX - width / 2) * 0.025;
      const offsetY = (mouseY - height / 2) * 0.025;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const depthFactor = (1000 - p.z) / 1000;
        const px = p.x + offsetX * depthFactor * 1.4;
        const py = p.y + offsetY * depthFactor * 1.4;
        const pSize = p.size * (depthFactor + 0.5);

        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 180, 0, ${p.alpha * depthFactor})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(244, 180, 0, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile, reducedMotion]);

  if (isMobile || reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      aria-hidden="true"
    />
  );
});

Automotive3DCanvas.displayName = 'Automotive3DCanvas';

// ============================================
// INTERACTIVE 3D PARALLAX TILT WRAPPER
// ============================================
const Interactive3DTilt = memo(({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isMobile || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
});

Interactive3DTilt.displayName = 'Interactive3DTilt';

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
// PREMIUM RIGHT SIDE IMAGE SLIDER WITH 3D DEPTH
// ============================================
const HeroImageSlider = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSlides = SLIDER_IMAGES.length;

  useEffect(() => {
    const preloadImages = () => {
      SLIDER_IMAGES.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => preloadImages());
      } else {
        setTimeout(preloadImages, 2000);
      }
    }
  }, []);

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
      intervalRef.current = setInterval(nextSlide, 4500);
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
    <Interactive3DTilt className="relative w-full max-w-sm mx-auto lg:max-w-[30rem] xl:max-w-[35rem] 2xl:max-w-[40rem] lg:mx-0 lg:justify-self-end">
      <div
        className="relative group w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Luxury vehicle showcase slider"
      >
        {/* Glowing 3D backdrop aura */}
        <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-[#F4B400]/20 via-blue-500/10 to-[#F59E0B]/20 blur-2xl transition-all duration-700 opacity-60 group-hover:opacity-100 group-hover:blur-3xl" />
        
        {/* Glass Container Frame */}
        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] border border-white/20 bg-gradient-to-b from-white/10 to-black/40 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-md">
          
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={prefersReducedMotion ? { opacity: 1 } : { 
                opacity: 0,
                scale: 1.06,
                x: direction > 0 ? 30 : -30
              }}
              animate={prefersReducedMotion ? { opacity: 1 } : { 
                opacity: 1,
                scale: 1,
                x: 0,
                transition: { 
                  duration: 1.0, 
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              exit={prefersReducedMotion ? { opacity: 1 } : { 
                opacity: 0,
                scale: 0.96,
                x: direction > 0 ? -30 : 30,
                transition: { 
                  duration: 0.6, 
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              className="relative aspect-[4/3] overflow-hidden rounded-[20px] sm:rounded-[24px] lg:rounded-[28px]"
            >
              <HeroImage
                src={SLIDER_IMAGES[currentIndex]}
                srcWebp={SLIDER_IMAGES[currentIndex]}
                alt={`Premium vehicle showcase ${currentIndex + 1}`}
                className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.04]"
                fallback="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop"
                priority={currentIndex === 0}
              />
              
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                aria-hidden="true"
              />
              
              {/* Dynamic light reflection sweep */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity, 
                  ease: 'linear',
                  repeatDelay: 3
                }}
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-[-25deg]" />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousSlide();
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 3000);
              }}
              className="pointer-events-auto p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:bg-[#F4B400] hover:text-black hover:border-[#F4B400] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 opacity-80 hover:opacity-100 shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} className="sm:size-[20px]" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 3000);
              }}
              className="pointer-events-auto p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:bg-[#F4B400] hover:text-black hover:border-[#F4B400] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 opacity-80 hover:opacity-100 shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight size={18} className="sm:size-[20px]" />
            </button>
          </div>

          {/* Slide Indicator Dots */}
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
                    ? 'w-5 sm:w-6 h-1.5 bg-[#F4B400] shadow-[0_0_12px_rgba(244,180,0,0.6)]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                }`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Floating Glass Promo Badge with 3D Depth */}
          <motion.div
            animate={prefersReducedMotion ? { y: 0 } : { y: [0, -5, 0] }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: 'translateZ(30px)' }}
            className="absolute -bottom-2 left-2 right-2 sm:left-3 sm:right-3 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] border border-white/20 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 lg:p-3.5 shadow-2xl lg:left-auto lg:bottom-3 lg:w-[18rem] xl:w-[20rem] 2xl:w-[22rem] pointer-events-none"
            role="complementary"
            aria-label="Luxury inventory promotion"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400]">
                  Luxury Inventory
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs lg:text-sm xl:text-base font-bold text-gray-900 truncate">
                  Premium cars with verified history
                </p>
              </div>
              <div 
                className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 xl:h-10 xl:w-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400] border border-[#F4B400]/30 shadow-inner"
                aria-hidden="true"
              >
                <CarFront size={14} className="sm:size-[16px] lg:size-[18px] xl:size-[20px]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Interactive3DTilt>
  );
});

HeroImageSlider.displayName = 'HeroImageSlider';

// ============================================
// MAIN HERO BANNER - PRODUCTION 3D EXPERIENCE
// ============================================
const HeroBanner = memo(function HeroBanner() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        minHeight: '100vh',
        maxHeight: '100vh',
        height: '100vh'
      }}
      aria-label="Hero banner showcasing premium used cars"
    >
      {/* Interactive 3D Ambient Canvas Background */}
      <Automotive3DCanvas isMobile={isMobile} reducedMotion={!!prefersReducedMotion} />

      {/* Layered Background Imagery & Lighting */}
      <div className="absolute inset-0 z-0">
        <HeroImage
          src="/images/banner1.jpeg"
          srcWebp="/images/banner1.webp"
          alt="Balaji Cars dealership showroom with premium vehicles on display"
          className="h-full w-full object-cover object-center opacity-80"
          fallback="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop"
          priority={true}
        />
        
        {/* Dark Vignette & Atmospheric Gradients */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/80"
          aria-hidden="true"
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,180,0,0.12),transparent_45%)]"
          aria-hidden="true"
        />
        
        {/* Subtle Architectural Mesh Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '90px 90px'
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content Grid Container */}
      <div className="container relative z-20 mx-auto px-4 h-full flex items-center py-8 sm:py-12 lg:py-0">
        <div className="w-full grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 xl:gap-12">
          
          {/* Left Text Content & CTAs */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[690px] text-center lg:text-left"
          >
            {/* Premium Pill Badge */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F4B400]/25 via-[#F4B400]/10 to-transparent border border-[#F4B400]/30 px-3 py-1.5 lg:px-4 lg:py-1.5 mb-2.5 shadow-[0_0_20px_rgba(244,180,0,0.15)] backdrop-blur-md"
            >
              <Sparkles size={14} className="text-[#F4B400]" />
              <span className="text-[10px] lg:text-xs font-semibold text-[#F4B400] tracking-wider uppercase">PREMIUM SELECTION</span>
            </motion.div>

            {/* Category Tagline */}
            <motion.p 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-[#F4B400]/90"
            >
              TRUSTED USED CAR DEALERSHIP
            </motion.p>
            
            {/* Main Headline */}
            <motion.h1 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1.5 sm:mt-2 lg:mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-[-0.04em] text-white drop-shadow-md"
            >
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F4B400] via-[#FFD700] to-[#F59E0B]">
                Pre-Owned Car
              </span>
            </motion.h1>
            
            {/* Supporting Description */}
            <motion.p 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-2.5 sm:mt-3.5 max-w-[620px] text-sm sm:text-base lg:text-lg leading-relaxed text-white/85 mx-auto lg:mx-0 font-normal"
            >
              Explore certified used cars with transparent pricing, verified quality, and flexible loan options.
            </motion.p>

            {/* Feature Badges */}
            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/90"
              role="list"
            >
              {FEATURES.map(({ label, icon: Icon }) => (
                <motion.span
                  key={label}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-[#F4B400]/40 shadow-sm"
                  role="listitem"
                >
                  <Icon size={13} className="text-[#F4B400] flex-shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap font-medium">{label}</span>
                </motion.span>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
            >
              <Link
                to="#car-listings"
                onClick={handleScrollToCars}
                className="group relative overflow-hidden inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-7 py-3.5 text-sm font-bold text-black shadow-[0_16px_45px_rgba(244,180,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(244,180,0,0.45)] active:scale-[0.98]"
                aria-label="Browse our inventory of premium used cars"
              >
                <span>Browse Cars</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" aria-hidden="true" />
                <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:-translate-y-1 active:scale-[0.98] shadow-lg"
                aria-label="Contact Balaji Cars dealership"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Interactive 3D Showcase Frame */}
          <HeroImageSlider />
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        animate={prefersReducedMotion ? { y: 0 } : { y: [0, 8, 0] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:block z-20"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-0.5 text-white/50 text-[9px] uppercase tracking-widest font-medium">
          <span>Scroll</span>
          <ArrowRight size={11} className="rotate-90 text-[#F4B400]" />
        </div>
      </motion.div>
    </section>
  );
});

export default HeroBanner;