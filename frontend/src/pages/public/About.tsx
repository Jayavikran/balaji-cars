import { Link } from 'react-router-dom';
import { BadgeCheck, CarFront, Handshake, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Trusted Inventory', text: 'Verified used cars chosen with a premium quality-first approach.' },
  { icon: BadgeCheck, title: 'Transparent Process', text: 'Clear pricing, clear paperwork, and a smooth buying experience.' },
  { icon: Handshake, title: 'Loan Support', text: 'Friendly finance guidance to help more customers drive home sooner.' },
  { icon: CarFront, title: 'Wide Selection', text: 'A curated mix of city cars, SUVs, sedans, and family vehicles.' },
];

export default function About() {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.companyName || 'BALAJI CARS';
  const seoTitle = `About ${siteName} | Premium Used Car Dealership`;
  const seoDescription = `Learn about ${siteName}, our mission, our quality checks, and why customers in Tirunelveli trust us for premium used cars.`;

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-white">
      <Seo title={seoTitle} description={seoDescription} />
      <Header settings={settings} showSearchBar={false} />

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img src="/images/banner3.jpeg" alt="Balaji Cars showroom" className="h-full w-full object-cover opacity-55" loading="eager" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(0,0,0,.22),rgba(0,0,0,.84)_66%)]" />
        </div>
        <div className="premium-shell relative z-10 py-16 sm:py-20 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#F4B400]">ABOUT US</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
              Premium used cars, trusted service, and a better buying experience.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
              Balaji Cars is built around one promise: help every customer find a verified vehicle with confidence, clarity, and care.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1">
        <section className="premium-shell py-12 sm:py-16 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="glass-card p-6 lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Mission</p>
              <h2 className="mt-3 text-3xl font-extrabold text-ink">Make premium used car buying simple, honest, and enjoyable.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-body sm:text-base">
                We focus on quality checks, transparent vehicle information, and helpful dealership support so customers can make a confident decision without the usual stress.
              </p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Vision</p>
              <p className="mt-3 text-sm leading-7 text-body sm:text-base">
                To become the most trusted premium used car destination in Tirunelveli, known for reliability, fairness, and a showroom experience that feels refined.
              </p>
            </div>
          </div>
        </section>

        <section className="premium-shell pb-12 sm:pb-16 lg:pb-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Why Choose Balaji Cars</p>
              <h2 className="mt-2 text-3xl font-extrabold text-ink">Built for trust and convenience.</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[22px] border border-line bg-white p-5 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-body">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-shell pb-12 sm:pb-16 lg:pb-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[28px] bg-black shadow-card">
              <img src="/images/banner1.jpeg" alt="Loan facility" className="h-72 w-full object-cover sm:h-80" loading="lazy" />
              <div className="p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Loan Facility</p>
                <p className="mt-3 text-xl font-bold">Supportive finance options for eligible buyers.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[28px] bg-black shadow-card">
              <img src="/images/banner2.jpeg" alt="Quality checked cars" className="h-72 w-full object-cover sm:h-80" loading="lazy" />
              <div className="p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Quality Checked Cars</p>
                <p className="mt-3 text-xl font-bold">Every listing is reviewed for a cleaner, more reliable buying journey.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="premium-shell pb-14 sm:pb-16 lg:pb-20">
          <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] bg-[#0F0F10] px-6 py-8 text-white sm:px-8 sm:py-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Ready to explore?</p>
              <h2 className="mt-3 text-3xl font-extrabold">Visit our dealership or browse the latest available cars.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/#car-listings" className="rounded-full bg-[#F4B400] px-5 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.01]">
                Browse Cars
              </Link>
              <Link to="/contact" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
