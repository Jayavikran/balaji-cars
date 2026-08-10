import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Building2,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Handshake,
  ShieldCheck,
  Sparkles,
  Star,
  Award,
  FileCheck2,
  IndianRupee,
  Quote,
  ArrowRight,
  Gem,
  Crown,
  Clock,
  Users,
  ThumbsUp,
  Zap,
  Heart,
  Target,
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// ============================================
// 1. TYPES & CONSTANTS
// ============================================

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  text: string;
  gradient?: string;
};

type StatCard = {
  value: number;
  label: string;
  suffix?: string;
  icon?: LucideIcon;
};

type TimelineItem = {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// ===== DEFAULT IMAGES =====
const DEFAULT_HERO_IMAGE = '/images/banner1.jpeg';
const DEFAULT_HERO_IMAGE_WEBP = '/images/banner1.webp';
const DEFAULT_STORY_IMAGE = '/images/banner1.jpeg';
const DEFAULT_STORY_IMAGE_WEBP = '/images/banner1.webp';

const LEADERSHIP_BADGES = [
  'Maruti Suzuki',
  'Hyundai Motors',
  'Tata Motors',
  'Mahindra & Mahindra',
  'Bajaj Two Wheelers',
];

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: '20+ Years Experience',
    text: 'Two decades of trusted dealership experience built on honesty, quality, and customer satisfaction.',
    gradient: 'from-[#F4B400]/20 to-[#F4B400]/5',
  },
  {
    icon: CheckCircle2,
    title: 'Certified Inspection',
    text: 'Every vehicle undergoes thorough inspection by experienced brand-trained technicians.',
    gradient: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: FileCheck2,
    title: 'Verified Service Records',
    text: 'Only vehicles with genuine and authentic service histories are selected.',
    gradient: 'from-green-500/20 to-green-500/5',
  },
  {
    icon: Sparkles,
    title: 'Service Warranty',
    text: 'Selected vehicles include reliable warranty support for added confidence.',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: IndianRupee,
    title: 'Best Exchange Value',
    text: 'Receive competitive and transparent valuations for your existing vehicle.',
    gradient: 'from-yellow-500/20 to-yellow-500/5',
  },
  {
    icon: BadgeCheck,
    title: '100% Name Transfer Support',
    text: 'Our experts manage complete ownership transfer documentation.',
    gradient: 'from-pink-500/20 to-pink-500/5',
  },
  {
    icon: Star,
    title: 'Transparent Pricing',
    text: 'Honest pricing with no hidden charges or unnecessary surprises.',
    gradient: 'from-orange-500/20 to-orange-500/5',
  },
  {
    icon: Handshake,
    title: 'Customer First',
    text: 'From first enquiry to final delivery, every customer receives professional support.',
    gradient: 'from-teal-500/20 to-teal-500/5',
  },
];

const EXPERIENCE_STATS: StatCard[] = [
  { value: 20, suffix: '+', label: 'Years of Trusted Service', icon: Clock },
  { value: 10000, suffix: '+', label: 'Happy Customers', icon: Users },
  { value: 5000, suffix: '+', label: 'Cars Sold', icon: CarFront },
  { value: 100, suffix: '%', label: 'Ownership Transfer Support', icon: ShieldCheck },
  { value: 5, suffix: '+', label: 'Leading Automobile Brands', icon: Building2 },
  { value: 4.9, label: '★ Customer Rating', icon: Star },
];

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    year: '2003',
    title: 'Foundation',
    description: 'Balaji Cars was established with a vision to provide premium pre-owned vehicles with trust and transparency.',
    icon: Gem,
  },
  {
    year: '2008',
    title: 'Expansion',
    description: 'Expanded showroom and service capabilities to serve more customers across the region.',
    icon: Building2,
  },
  {
    year: '2013',
    title: 'Industry Recognition',
    description: 'Recognized as one of the most trusted used car dealerships in Southern Tamil Nadu.',
    icon: Award,
  },
  {
    year: '2018',
    title: 'Digital Transformation',
    description: 'Launched online inventory showcase with digital verification and seamless enquiry management.',
    icon: Zap,
  },
  {
    year: '2023',
    title: '20 Years of Excellence',
    description: 'Celebrated two decades of serving thousands of happy vehicle owners with premium standards.',
    icon: Crown,
  },
];

const CORE_VALUES = [
  { icon: Heart, label: 'Integrity', color: '#F4B400' },
  { icon: ShieldCheck, label: 'Trust', color: '#3B82F6' },
  { icon: Target, label: 'Dedication', color: '#10B981' },
  { icon: Users, label: 'Responsibility', color: '#8B5CF6' },
  { icon: ThumbsUp, label: 'Customer Service', color: '#F59E0B' },
];

// ============================================
// 2. ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ============================================
// 3. OPTIMIZED ANIMATED COUNTER
// ============================================

const AnimatedCounter = memo(({ 
  value, 
  suffix = '', 
  active,
  icon: Icon,
  label,
}: { 
  value: number; 
  suffix?: string; 
  active: boolean;
  icon?: LucideIcon;
  label: string;
}) => {
  const [count, setCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active || prefersReducedMotion) {
      setCount(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, value, prefersReducedMotion]);

  return (
    <motion.div 
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      className="group relative rounded-2xl border border-white/12 bg-white/5 p-5 sm:p-6 text-center transition-all duration-300 hover:bg-white/10 hover:border-[#F4B400]/40 shadow-lg"
    >
      {Icon && (
        <div className="mb-3 flex justify-center">
          <div className="rounded-full bg-[#F4B400]/15 p-2.5 group-hover:scale-110 transition-transform duration-300 text-[#F4B400]">
            <Icon size={22} aria-hidden="true" />
          </div>
        </div>
      )}
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
          {count}
        </span>
        {suffix && (
          <span className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#F4B400]">
            {suffix}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs sm:text-sm leading-snug text-white/80 font-medium">{label}</p>
    </motion.div>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// ============================================
// 4. MAIN ABOUT COMPONENT
// ============================================

type AboutProps = {
  heroImage?: string;
  heroImageWebp?: string;
  storyImage?: string;
  storyImageWebp?: string;
};

export default memo(function About({
  heroImage = DEFAULT_HERO_IMAGE,
  heroImageWebp = DEFAULT_HERO_IMAGE_WEBP,
  storyImage = DEFAULT_STORY_IMAGE,
  storyImageWebp = DEFAULT_STORY_IMAGE_WEBP,
}: AboutProps) {
  const { data: settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();
  const companyName = settings?.companyName || 'BALAJI CARS';
  const seoTitle = `About ${companyName} | Premium Certified Used Car Dealership`;
  const seoDescription = `Learn about ${companyName}, our 20+ years of dealership experience, leadership expertise, certified vehicle standards, and community trust.`;

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical="/about"
        openGraph={{
          title: seoTitle,
          description: seoDescription,
          images: [{ url: heroImage, alt: `${companyName} About Page` }],
        }}
      />
      <Header settings={settings} showSearchBar={false} />

      {/* ===== HERO SECTION ===== */}
      <header className="relative overflow-hidden bg-black text-white py-20 sm:py-28 lg:py-36 flex items-center" role="banner">
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet={heroImageWebp} type="image/webp" />
            <img
              src={heroImage}
              alt={`${companyName} premium showroom`}
              className="h-full w-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000"
              loading="eager"
              decoding="async"
            />
          </picture>
          
          {/* Dark Cinematic Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,180,0,0.12),transparent_50%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-center sm:text-left"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-[#F4B400]/30 bg-gradient-to-r from-[#F4B400]/20 to-transparent backdrop-blur-md px-3.5 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400] shadow-sm"
            >
              <Crown size={14} className="text-[#F4B400]" />
              About {companyName}
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              Over 20 Years of Trusted
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F4B400] via-[#FFD700] to-[#F59E0B]">
                Automotive Excellence
              </span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-white/85 mx-auto sm:mx-0 font-normal"
            >
              Welcome to {companyName}, your most trusted destination for premium pre-owned vehicles. 
              For over two decades, our reputation has been built on certified quality, complete transparency, and customer devotion.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3.5"
            >
              <Link
                to="/#car-listings"
                className="group relative overflow-hidden inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-8 py-4 text-sm font-bold text-black shadow-[0_16px_40px_rgba(244,180,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(244,180,0,0.4)] active:scale-[0.98]"
              >
                <span>Browse Inventory</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg"
              >
                <span>Contact Us</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block z-10"
        >
          <div className="flex flex-col items-center gap-1 text-white/40 text-[10px] uppercase tracking-widest font-medium">
            <span>Scroll</span>
            <ChevronRight size={14} className="rotate-90 text-[#F4B400]" />
          </div>
        </motion.div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1" role="main">
        
        {/* Welcome & Philosophy Cards */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24" aria-labelledby="about-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-stretch"
          >
            <motion.div variants={itemVariants} className="rounded-3xl border border-line bg-white p-6 sm:p-10 shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F4B400]/10 px-3 py-1 text-xs font-bold text-[#F4B400] uppercase tracking-wider mb-3">
                  <Sparkles size={14} /> About {companyName}
                </div>
                <h2 id="about-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                  Welcome to {companyName}
                </h2>
                <p className="mt-3 text-base sm:text-lg font-semibold text-ink/80">
                  Your most trusted destination for premium pre-owned vehicles with over 20 years of excellence.
                </p>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-body">
                  Our success is built on one simple promise — delivering quality vehicles with complete transparency, verified inspection records, and genuine customer satisfaction.
                </p>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-body">
                  Every vehicle is personally inspected by our experienced, brand-certified technicians, ensuring only the finest automobiles reach our showroom floor.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-line/60">
                {CORE_VALUES.map(({ icon: Icon, label, color }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-line/50 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-xs"
                  >
                    <Icon size={14} style={{ color }} />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="rounded-3xl bg-gradient-to-br from-[#121214] via-[#1a1a20] to-[#0f0f12] border border-[#F4B400]/25 p-6 sm:p-10 text-white shadow-2xl flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B400]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="rounded-2xl bg-[#F4B400]/20 p-3.5 text-[#F4B400] border border-[#F4B400]/30 shadow-inner">
                  <Quote size={28} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#F4B400]">Our Promise</p>
                  <p className="mt-3 text-base sm:text-lg leading-relaxed text-white/90 font-medium">
                    Premium certified vehicles, honest guidance, dealership-level inspection standards, and support that makes every buying step feel effortless and secure.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="stats-heading">
          <div ref={statsRef}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-3xl bg-gradient-to-br from-[#0F0F10] via-[#161619] to-[#1a1a1e] border border-white/10 p-6 sm:p-12 shadow-2xl relative overflow-hidden text-white"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4B400]/10 rounded-full blur-3xl pointer-events-none" />

              <motion.div variants={itemVariants} className="relative z-10 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]">
                  20+ Years of Automotive Excellence
                </p>
                <h2 id="stats-heading" className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Trusted by Thousands of Happy Owners
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/75">
                  Our experience goes beyond selling cars. It is built on understanding customer needs, maintaining strict dealership-level inspection standards, and providing transparent guidance.
                </p>
              </motion.div>

              <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6 relative z-10">
                {EXPERIENCE_STATS.map((stat) => (
                  <AnimatedCounter
                    key={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    icon={stat.icon}
                    active={statsInView}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="timeline-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div variants={itemVariants} className="max-w-3xl mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Our Journey</p>
              <h2 id="timeline-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                Two Decades of Continuous Growth
              </h2>
              <p className="mt-2 text-sm sm:text-base text-body">
                From a passionate foundation to a leading pre-owned car destination in the region.
              </p>
            </motion.div>

            {/* Timeline Layout */}
            <div className="relative">
              {/* Vertical Center Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F4B400] via-[#F4B400]/40 to-[#F4B400]/10 sm:left-1/2 -translate-x-1/2 z-0" />
              
              {TIMELINE_ITEMS.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col gap-4 sm:flex-row ${
                    index % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12 sm:flex-row-reverse'
                  } mb-10 last:mb-0 sm:mb-16 z-10`}
                >
                  {/* Content Box */}
                  <div className={`flex-1 pl-14 sm:pl-0 ${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                    <div className={`inline-block whitespace-nowrap rounded-full bg-[#F4B400]/15 border border-[#F4B400]/30 px-4 py-1.5 text-xs font-extrabold text-[#F4B400] shadow-sm ${
                      index % 2 === 0 ? 'sm:float-right' : 'sm:float-left'
                    }`}>
                      {item.year}
                    </div>
                    <div className="mt-3 clear-both bg-white border border-line rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl hover:border-[#F4B400]/40">
                      <h3 className="text-lg sm:text-xl font-extrabold text-ink">{item.title}</h3>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-body">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Center Node Icon */}
                  <div className="absolute left-4 top-0 -translate-x-1/2 sm:left-1/2 sm:top-1/2 sm:-translate-y-1/2 z-20">
                    <motion.div 
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.15 }}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#F4B400] to-[#F59E0B] text-black shadow-[0_0_20px_rgba(244,180,0,0.4)] border-2 border-black"
                    >
                      <item.icon size={20} />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 hidden sm:block" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Feature Cards Grid */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="features-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.div variants={itemVariants} className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Why Choose Us</p>
              <h2 id="features-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                Premium Reasons to Trust {companyName}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-body">
                Eight core pillars ensuring complete confidence with every pre-owned car purchase.
              </p>
            </motion.div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURE_CARDS.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={scaleVariants}
                    whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:shadow-2xl hover:border-[#F4B400]/30"
                  >
                    <div className={`rounded-2xl bg-gradient-to-br ${item.gradient} p-3 w-fit group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} className="text-[#F4B400]" />
                    </div>
                    <h3 className="mt-4 text-base sm:text-lg font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-body">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Leadership Section */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="leadership-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.div variants={itemVariants} className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Leadership</p>
              <h2 id="leadership-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                Leadership & Industry Expertise
              </h2>
              <p className="mt-2 text-sm sm:text-base text-body">
                Founded by automotive veterans with technical and executive background across major Indian OEMs.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-2.5">
              {LEADERSHIP_BADGES.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-ink shadow-xs transition-all hover:bg-[#F4B400]/10 hover:border-[#F4B400]/40"
                >
                  <BadgeCheck size={16} className="text-[#F4B400]" />
                  {label}
                </span>
              ))}
            </motion.div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Award,
                  title: 'Leadership Roles',
                  text: 'Our founders have held key technical and management roles in India\'s leading automotive companies.',
                },
                {
                  icon: Building2,
                  title: 'Technical Depth',
                  text: 'Hands-on OEM experience enables dealership-level standards in multi-point inspection and quality control.',
                },
                {
                  icon: CarFront,
                  title: 'Customer Trust',
                  text: 'That professional background lets us deliver a buying journey built on clarity, reliability, and peace of mind.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={scaleVariants}
                    whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                    className="rounded-3xl border border-line bg-white p-6 shadow-card transition-all hover:shadow-xl hover:border-[#F4B400]/30"
                  >
                    <div className="rounded-2xl bg-[#F4B400]/10 p-3 w-fit">
                      <Icon size={24} className="text-[#F4B400]" />
                    </div>
                    <h3 className="mt-4 text-base sm:text-lg font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-body">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="story-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center"
          >
            <motion.div variants={itemVariants} className="rounded-3xl bg-gradient-to-br from-[#FFF9E7] via-[#FFF3CD] to-[#FFF0BC] border border-[#F4B400]/30 p-6 sm:p-10 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Our Story</p>
              <h2 id="story-heading" className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
                The Devotion Behind "{companyName}"
              </h2>
              <p className="mt-3 text-base sm:text-lg font-semibold text-ink/90">
                The name {companyName} represents our deep devotion to Lord Sri Venkateswara (Tirupati Balaji).
              </p>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-body">
                Our faith inspires the fundamental values on which our dealership operates every single day:
              </p>
              <ul className="mt-5 space-y-2.5">
                {CORE_VALUES.map(({ icon: Icon, label, color }) => (
                  <li key={label} className="flex items-center gap-3 text-xs sm:text-sm text-body font-medium">
                    <Icon size={18} style={{ color }} className="flex-shrink-0" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={scaleVariants} className="overflow-hidden rounded-3xl shadow-2xl border border-line">
              <picture>
                <source srcSet={storyImageWebp} type="image/webp" />
                <img
                  src={storyImage}
                  alt={`${companyName} premium vehicle showroom`}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </motion.div>
          </motion.div>
        </section>

        {/* Philosophy Quote Section */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24">
          <motion.blockquote
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="rounded-3xl bg-gradient-to-br from-[#121214] via-[#1a1a20] to-[#0f0f12] border border-[#F4B400]/25 p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#F4B400]/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div variants={itemVariants} className="flex items-start gap-5 relative z-10">
              <div className="rounded-2xl bg-[#F4B400]/20 p-4 text-[#F4B400] border border-[#F4B400]/30 shrink-0">
                <Quote size={30} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#F4B400]">Our Philosophy</p>
                <p className="mt-3 text-xl sm:text-3xl font-extrabold leading-snug tracking-tight text-white">
                  "With His divine grace leading our way and your trust driving us forward, {companyName} is committed to delivering excellence in every journey."
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-xs font-bold text-[#F4B400] tracking-wider uppercase">Balaji Cars Team</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
              </div>
            </motion.div>
          </motion.blockquote>
        </section>

        {/* CTA Banner */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F0F10] to-[#1a1a1a] p-6 sm:p-12 shadow-2xl border border-white/10 text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B400]/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div variants={itemVariants} className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Ready to Explore?</p>
                <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Visit Our Dealership or Browse Premium Vehicles
                </h2>
                <p className="mt-2 text-sm sm:text-base text-white/75">
                  Experience the {companyName} difference. Our team is ready to help you find your perfect vehicle.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                <Link
                  to="/#car-listings"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-8 py-4 text-sm font-bold text-black shadow-lg hover:scale-105 transition-all"
                >
                  <span>Browse Cars</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

      </main>

      <Footer settings={settings} />
    </div>
  );
});