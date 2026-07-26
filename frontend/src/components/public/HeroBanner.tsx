import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const slides = [
  {
    title: "BALAJI CARS",
    subtitle: "Buy & Sell Premium Used Cars with Confidence.",
    image: "/images/banner1.jpeg"
  },
  {
    title: "Best Deals on Used Cars",
    subtitle: "Quality Cars • Best Price • Trusted Dealer",
    image: "/images/banner2.jpeg",
  },
  {
    title: "Drive Your Dream Car",
    subtitle: "100+ Certified Cars Available",
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
      className="relative h-[200px] sm:h-[520px] lg:h-[600px] overflow-hidden bg-gray-900 mx-3 mt-3 rounded-2xl sm:mx-0 sm:mt-0 sm:rounded-none"
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
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-start justify-center">
        <motion.div 
          key={`text-${index}`} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl"
        >
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
            {slides[index].title}
          </h1>
          <p className="mt-2 sm:mt-4 text-white/90 max-w-md text-xs sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-none">
            {slides[index].subtitle}
          </p>
          <button
            type="button"
            onClick={() =>
              document.getElementById('car-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="mt-4 sm:mt-8 w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors duration-200 text-sm sm:text-base"
          >
            Explore Cars
          </button>
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goto(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => goto(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              i === index 
                ? 'w-8 sm:w-10 bg-white' 
                : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}