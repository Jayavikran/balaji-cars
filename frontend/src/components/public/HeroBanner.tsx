import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const slides = [
  {
    title: "Premium Used Cars",
    subtitle: "Quality Assured • Best Prices",
    image: "/images/banner1.jpeg"
  },
  {
    title: "Best Deals",
    subtitle: "100+ Certified Cars Available",
    image: "/images/banner2.jpeg",
  },
  {
    title: "Drive Your Dream",
    subtitle: "Trusted Dealer Since 1995",
    image: "/images/banner3.jpeg",
  },
];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const goto = (i: number) => {
    const newIndex = (i + slides.length) % slides.length;
    setIndex(newIndex);
  };

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative hero-mobile w-full overflow-hidden rounded-2xl mx-4 mt-4"
      style={{ height: '200px' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img 
            src={slides[index].image} 
            alt={slides[index].title} 
            className="w-full h-full object-cover"
          />
          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-navy/90 via-dark-navy/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-start justify-center px-6 hero-content">
        <motion.div 
          key={`text-${index}`} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xs"
        >
          <h1 className="text-white font-bold hero-title">
            {slides[index].title}
          </h1>
          <p className="text-white/80 hero-subtitle">
            {slides[index].subtitle}
          </p>
          <button
            type="button"
            onClick={() =>
              document.getElementById('car-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="hero-cta bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Browse Cars →
          </button>
        </motion.div>
      </div>

      {/* Navigation Buttons - Hidden on mobile */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goto(index - 1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hidden sm:flex"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => goto(index + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hidden sm:flex"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index 
                ? 'w-6 bg-white' 
                : 'w-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}