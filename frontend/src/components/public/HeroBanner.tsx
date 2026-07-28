import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, CarFront, Handshake, ShieldCheck, ArrowRight } from 'lucide-react';

const FEATURES = [
  { label: 'Certified Cars', icon: ShieldCheck },
  { label: 'Loan Facility', icon: Handshake },
  { label: 'RC Transfer', icon: BadgeCheck },
  { label: 'Best Price', icon: CarFront },
];

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <img
          src="/images/banner1.jpeg"
          alt="Balaji Cars dealership showroom"
          className="h-full w-full object-cover object-center opacity-75"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.78)_0%,rgba(0,0,0,.48)_50%,rgba(0,0,0,.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,180,0,.08),transparent_30%)]" />
      </div>

      <div className="premium-shell relative z-10 py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-[690px]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#F4B400] sm:text-sm">
              TRUSTED USED CAR DEALERSHIP
            </p>
            <h1 className="mt-4 text-[2.05rem] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:mt-5 sm:text-[3.1rem] lg:text-[3.7rem] xl:text-[4rem]">
              Find Your Perfect
              <span className="block">Pre-Owned Car</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-sm leading-7 text-white/82 sm:mt-6 sm:text-base lg:text-lg">
              Explore certified used cars with transparent pricing, verified quality, and flexible loan options.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-white/88 sm:mt-8 sm:gap-3 sm:text-sm">
              {FEATURES.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 backdrop-blur-md sm:px-4 sm:py-2"
                >
                  <Icon size={15} className="text-[#F4B400]" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <button
                type="button"
                onClick={() => document.getElementById('car-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center gap-3 rounded-full bg-[#F4B400] px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(244,180,0,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f7c233] sm:px-6 sm:py-3.5"
              >
                Browse Cars
                <ArrowRight size={18} />
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/6 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/10 sm:px-6 sm:py-3.5"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            className="relative w-full aspect-[4/3] lg:max-w-[40rem] lg:justify-self-end"
          >
            <div className="absolute inset-0 rounded-[28px] border border-white/12 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,.3)] backdrop-blur-sm" />
            <div className="absolute inset-0 overflow-hidden rounded-[28px]">
              <img
                src="/images/banner2.jpeg"
                alt="Premium Balaji Cars vehicle showcase"
                className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/12" />
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 left-4 right-4 rounded-[24px] border border-white/10 bg-white/92 p-3.5 text-ink shadow-card lg:left-auto lg:bottom-6 lg:w-[22rem] lg:p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Luxury inventory</p>
                  <p className="mt-1 text-base font-bold sm:text-lg">Premium cars with verified history</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400] sm:h-12 sm:w-12">
                  <CarFront size={22} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
