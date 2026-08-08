import { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  Medal,
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

// ===== DEFAULT IMAGES (fallback if no props provided) =====
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
    description: 'Expanded showroom and service capabilities to serve more customers.',
    icon: Building2,
  },
  {
    year: '2013',
    title: 'Industry Recognition',
    description: 'Recognized as one of the most trusted used car dealerships in the region.',
    icon: Award,
  },
  {
    year: '2018',
    title: 'Digital Transformation',
    description: 'Launched online presence with virtual showroom and digital inventory management.',
    icon: Zap,
  },
  {
    year: '2023',
    title: '20 Years of Excellence',
    description: 'Celebrated two decades of serving the community with premium vehicles and exceptional service.',
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },
};

// ============================================
// 3. OPTIMIZED SUB-COMPONENTS
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
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
      {Icon && (
        <div className="mb-3 flex justify-center">
          <div className="rounded-full bg-[#F4B400]/10 p-2.5 group-hover:scale-110 transition-transform duration-300">
            <Icon size={20} className="text-[#F4B400]" aria-hidden="true" />
          </div>
        </div>
      )}
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {count}
        </span>
        {suffix && (
          <span className="font-display text-2xl font-bold text-[#F4B400] sm:text-3xl lg:text-4xl">
            {suffix}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-white/75">{label}</p>
    </div>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// ============================================
// 4. MAIN COMPONENT (with image props)
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
  const seoTitle = `About ${companyName} | Premium Used Car Dealership`;
  const seoDescription = `Learn about ${companyName}, our 20+ years of experience, leadership expertise, and why customers trust us for premium pre-owned vehicles.`;

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
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

      {/* ===== HERO SECTION – using props for background ===== */}
      <header className="relative overflow-hidden bg-black text-white" role="banner">
        <div className="absolute inset-0">
          <picture>
            <source srcSet={heroImageWebp} type="bnner1/jpeg" />
            <img
              src={heroImage}
              alt={`${companyName} premium showroom`}
              className="h-full w-full object-cover opacity-40"
              loading="eager"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400] backdrop-blur-sm"
            >
              <Crown size={14} className="text-[#F4B400]" />
              About {companyName}
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              About {companyName}
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-xl font-semibold text-[#F4B400] sm:text-2xl lg:text-3xl"
            >
              Over 20 Years of Trusted Automotive Excellence
            </motion.p>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg"
            >
              Welcome to {companyName}, your trusted destination for premium pre-owned vehicles. 
              For more than 20 years, we have built our reputation on quality, transparency, 
              and customer satisfaction.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/#car-listings"
                className="group inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#F4B400]/25 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                Browse Inventory
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        >
          <div className="flex flex-col items-center gap-1 text-white/40 text-xs uppercase tracking-widest">
            <span>Scroll</span>
            <ChevronRight size={14} className="rotate-90" />
          </div>
        </motion.div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1" role="main">
        {/* About Section */}
        <section className="container mx-auto px-4 py-16 sm:py-20 lg:py-24" aria-labelledby="about-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <motion.div variants={itemVariants} className="rounded-3xl border border-line bg-white p-8 shadow-xl sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">About {companyName}</p>
              <h2 id="about-heading" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Welcome to {companyName}
              </h2>
              <p className="mt-4 text-lg font-medium text-ink/80">
                Your most trusted destination for premium pre-owned vehicles with over 20 years of excellence.
              </p>
              <p className="mt-6 text-base leading-8 text-body">
                Our success is built on one simple promise - delivering quality vehicles with complete 
                transparency and customer satisfaction.
              </p>
              <p className="mt-4 text-base leading-8 text-body">
                Every vehicle is personally inspected by our experienced, brand-certified technicians, 
                ensuring only the finest automobiles reach our showroom.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {CORE_VALUES.map(({ icon: Icon, label, color }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium"
                  >
                    <Icon size={12} style={{ color }} />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="rounded-3xl bg-gradient-to-br from-[#F4B400]/10 to-[#F4B400]/5 border border-[#F4B400]/20 p-8 flex flex-col justify-center"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[#F4B400]/20 p-3 text-[#F4B400]">
                  <Quote size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Our Promise</p>
                  <p className="mt-2 text-base leading-8 text-body font-medium">
                    Premium vehicles, honest guidance, dealership-level inspection standards, 
                    and support that makes every step feel effortless.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="stats-heading">
          <div ref={statsRef}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-3xl bg-gradient-to-br from-[#0F0F10] to-[#1a1a1a] p-8 shadow-2xl sm:p-12"
            >
              <motion.div variants={itemVariants}>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">
                  20+ Years of Automotive Excellence
                </p>
                <h2 id="stats-heading" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Trusted by Thousands of Customers
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
                  Our experience goes beyond selling cars. It is built on understanding customer needs, 
                  maintaining dealership-level inspection standards, and providing honest guidance.
                </p>
              </motion.div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="timeline-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants}>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Our Journey</p>
              <h2 id="timeline-heading" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Two Decades of Excellence
              </h2>
            </motion.div>

            <div className="mt-10 relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#F4B400]/20 sm:left-1/2" />
              
              {TIMELINE_ITEMS.map((item, index) => (
                <motion.div
                  key={item.year}
                  variants={itemVariants}
                  className={`relative flex flex-col gap-4 sm:flex-row ${
                    index % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12 sm:flex-row-reverse'
                  } mb-8 last:mb-0 sm:mb-12`}
                >
                  {/* Mobile: pl-14 pushes the year/title/description clear of the
                      absolutely-positioned icon (which sits at left-4, ~36px wide
                      including its circle) so nothing renders underneath it.
                      sm:pl-0 restores the original desktop layout untouched. */}
                  <div className={`flex-1 pl-14 sm:pl-0 ${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                    <div className={`inline-block whitespace-nowrap rounded-2xl bg-[#F4B400]/10 px-4 py-1.5 text-sm font-bold text-[#F4B400] ${
                      index % 2 === 0 ? 'sm:float-right' : 'sm:float-left'
                    }`}>
                      {item.year}
                    </div>
                    <div className="mt-3">
                      <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                      <p className="mt-2 text-base leading-7 text-body">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="absolute left-4 top-0 -translate-x-1/2 sm:left-1/2 sm:top-auto">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4B400] text-black shadow-lg shadow-[#F4B400]/25">
                      <item.icon size={18} />
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden sm:block" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Feature Cards Grid */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="features-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants}>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Why Choose Us</p>
              <h2 id="features-heading" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Premium Reasons to Trust {companyName}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-body">
                Eight premium reasons customers trust us for their next vehicle.
              </p>
            </motion.div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURE_CARDS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={scaleVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className={`rounded-2xl bg-gradient-to-br ${item.gradient} p-3 w-fit group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} className="text-[#F4B400]" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-body">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Leadership Section */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="leadership-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants}>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Leadership</p>
              <h2 id="leadership-heading" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Leadership & Industry Expertise
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-body">
                Founded by professionals with leadership and technical experience from India's leading automobile manufacturers.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-3">
              {LEADERSHIP_BADGES.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-all hover:bg-[#F4B400]/5 hover:scale-105"
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
                  text: 'Our founders have held leadership and technical positions in some of India\'s most respected automotive companies.',
                },
                {
                  icon: Building2,
                  title: 'Technical Depth',
                  text: 'Real-world experience helps us maintain dealership-level standards in inspection, selection, and quality assurance.',
                },
                {
                  icon: CarFront,
                  title: 'Customer Trust',
                  text: 'That industry background lets us deliver a premium buying journey built on clarity, reliability, and support.',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={scaleVariants}
                    whileHover={{ y: -8 }}
                    className="rounded-3xl border border-line bg-[#FAFAFA] p-6 shadow-card transition-all hover:shadow-xl"
                  >
                    <div className="rounded-2xl bg-[#F4B400]/10 p-3 w-fit">
                      <Icon size={24} className="text-[#F4B400]" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-body">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Story Section – using props for image */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24" aria-labelledby="story-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <motion.div variants={itemVariants} className="rounded-3xl bg-gradient-to-br from-[#FFF9E7] to-[#FFF3CD] border border-[#F4B400]/20 p-8 shadow-xl sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Our Story</p>
              <h2 id="story-heading" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                The Story Behind "{companyName}"
              </h2>
              <p className="mt-4 text-lg font-medium text-ink/80">
                The name {companyName} represents our deep devotion to Lord Sri Venkateswara (Tirupati Balaji).
              </p>
              <p className="mt-6 text-base leading-8 text-body">
                Our faith inspires the principles on which our business stands:
              </p>
              <ul className="mt-6 space-y-3">
                {CORE_VALUES.map(({ icon: Icon, label, color }) => (
                  <li key={label} className="flex items-center gap-3 text-base text-body">
                    <Icon size={18} style={{ color }} className="flex-shrink-0" />
                    <span className="font-medium">{label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-base leading-8 text-body font-medium">
                These values guide every decision we make and every customer relationship we build.
              </p>
            </motion.div>

            <motion.div variants={scaleVariants} className="overflow-hidden rounded-3xl shadow-2xl">
              <picture>
                <source srcSet={storyImageWebp} type="banner2/jpeg" />
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

        {/* Quote Section */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24">
          <motion.blockquote
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-[#FAFAFA] to-white border border-line p-8 shadow-xl sm:p-12"
          >
            <motion.div variants={itemVariants} className="flex items-start gap-6">
              <div className="rounded-2xl bg-[#F4B400]/10 p-4 text-[#F4B400]">
                <Quote size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Our Philosophy</p>
                <p className="mt-4 text-2xl font-semibold leading-[1.4] tracking-tight text-ink sm:text-3xl lg:text-4xl">
                  "With His divine grace leading our way and your trust driving us forward, {companyName}  is committed to delivering excellence in every journey."
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#F4B400]/20" />
                  <span className="text-sm font-medium text-[#F4B400]">Balaji Cars Team</span>
                  <div className="h-px flex-1 bg-[#F4B400]/20" />
                </div>
              </div>
            </motion.div>
          </motion.blockquote>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F0F10] to-[#1a1a1a] p-8 shadow-2xl sm:p-12"
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B400] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
            </div>

            <motion.div variants={itemVariants} className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F4B400]">Ready to Explore?</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Visit Our Dealership or Browse Premium Vehicles
                </h2>
                <p className="mt-3 text-base text-white/70">
                  Experience the {companyName} difference. Our team is ready to help you find your perfect vehicle.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/#car-listings"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#F4B400]/25 active:scale-95"
                >
                  Browse Cars
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95"
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