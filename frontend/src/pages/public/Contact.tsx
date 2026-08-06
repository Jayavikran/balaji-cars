import { useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  Send, 
  MapPin, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  Heart,
  type LucideIcon
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ContactFormValues {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

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

const ContactCard = ({ 
  icon: Icon, 
  label, 
  value, 
  href,
}: { 
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) => {
  const content = (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl border border-line bg-white p-4 sm:p-6 shadow-card transition-all duration-300 hover:shadow-2xl"
    >
      <div className="rounded-full bg-[#F4B400]/15 p-2.5 sm:p-3 w-fit transition-all duration-300 group-hover:scale-110">
        <Icon size={18} className="text-[#F4B400] sm:size-[22px]" />
      </div>
      <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#F4B400]">{label}</p>
      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base font-semibold text-ink transition-colors group-hover:text-[#F4B400]">
        {value}
      </p>
    </motion.div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
};

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<ContactFormValues>();
  const [submitted, setSubmitted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });

  const siteName = settings?.companyName || 'BALAJI CARS';
  const seoTitle = `Contact ${siteName} | Premium Used Cars`;
  const seoDescription = `Contact ${siteName} for used car enquiries, dealership visits, and support with finance or vehicle details.`;

  const mapSrc = 'https://www.google.com/maps/embed?q=Balaji+Cars+Tirunelveli';
  const fullMapUrl = 'https://www.google.com/maps/place/Balaji+Cars/@8.7029214,77.7217774,15z';

  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
    : undefined;

  const formattedPhone = settings?.phoneNumber 
    ? settings.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    : null;

  const onSubmit = async (values: ContactFormValues) => {
    const body = [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : '',
      '',
      values.message,
    ].filter(Boolean).join('\n');

    if (settings?.email) {
      try {
        window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(`${siteName} enquiry from ${values.name}`)}&body=${encodeURIComponent(body)}`;
        toast.success('Opening your email app. We\'ll respond within 24 hours!');
        reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } catch (error) {
        toast.error('Failed to open email. Please try again.');
      }
      return;
    }

    toast.error('Contact details are not available right now.');
  };

  const businessHours = [
    { day: 'Monday - Saturday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 6:00 PM' },
  ];

  const trustStats = [
    { icon: ShieldCheck, value: '20+', label: 'Years Experience', color: '#F4B400' },
    { icon: Users, value: '10K+', label: 'Happy Customers', color: '#3B82F6' },
    { icon: Star, value: '4.9', label: 'Customer Rating', color: '#10B981' },
    { icon: Award, value: '5+', label: 'Brand Awards', color: '#8B5CF6' },
  ];

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
      <Seo title={seoTitle} description={seoDescription} />
      <Header settings={settings} showSearchBar={false} />

      {/* ===== HERO SECTION WITH BACKGROUND IMAGE ===== */}
      <header className="relative overflow-hidden bg-black text-white min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] flex items-center" role="banner">
        {/* Background Image */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/images/banner4.png" type="image/jpeg" />
            <img 
              src="/images/banner4.png" 
              alt={`Contact ${siteName} - Premium car dealership`} 
              className="h-full w-full object-cover object-center" 
              loading="eager" 
              decoding="async" 
            />
          </picture>
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* Decorative gold gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F4B400]/10 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            className="max-w-4xl text-center sm:text-left"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-[#F4B400]"
            >
              <MessageCircle size={12} className="text-[#F4B400] sm:size-[14px]" />
              Get in Touch
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              Let Us Help You Find
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F4B400] to-[#F59E0B]">
                the Right Car
              </span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base lg:text-lg leading-7 sm:leading-8 text-white/80 mx-auto sm:mx-0"
            >
              Visit our dealership, send an enquiry, or reach us directly by phone, WhatsApp, or email. 
              Our expert team is ready to assist you.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4"
            >
              <a
                href="#contact-form"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(244,180,0,.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_60px_rgba(244,180,0,.35)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                Send Enquiry
                <Send size={16} className="transition-transform group-hover:translate-x-1 sm:size-[18px]" />
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <MessageCircle size={16} className="sm:size-[18px]" />
                  WhatsApp
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Animated scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        >
          <div className="flex flex-col items-center gap-1 text-white/40 text-xs uppercase tracking-widest">
            <span>Scroll</span>
            <ChevronRight size={14} className="rotate-90" />
          </div>
        </motion.div>
      </header>

      <main className="flex-1">
        <section ref={statsRef} className="container mx-auto px-4 -mt-8 sm:-mt-10 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            {trustStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={scaleVariants}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="rounded-2xl bg-white border border-line p-3 sm:p-4 text-center shadow-xl transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="flex justify-center">
                    <div className="rounded-full bg-[#F4B400]/10 p-2 sm:p-2.5">
                      <Icon size={15} style={{ color: stat.color }} className="sm:size-[18px]" />
                    </div>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-bold text-ink">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-body">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-8 sm:py-16 lg:py-24" aria-labelledby="contact-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
              <motion.div 
                variants={scaleVariants}
                className="overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-white shadow-xl transition-all duration-300 hover:shadow-2xl relative"
              >
                <iframe
                  title={`${siteName} location map`}
                  src={mapSrc}
                  className="h-[16rem] sm:h-[22rem] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  onError={(e) => {
                    const iframe = e.currentTarget;
                    iframe.style.display = 'none';
                    const parent = iframe.parentNode;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'h-[16rem] sm:h-[22rem] flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-4 sm:p-6';
                      fallback.innerHTML = `
                        <p class="text-base sm:text-lg font-semibold text-ink">📍 Balaji Cars</p>
                        <p class="text-xs sm:text-sm text-body text-center max-w-xs">Vasanthapuram S St Rd, Vasanth Nagar, Tirunelveli, Tamil Nadu 627005</p>
                        <a href="${fullMapUrl}" 
                           target="_blank" rel="noreferrer"
                           class="mt-3 inline-block rounded-full bg-[#F4B400] px-4 py-2 text-sm font-semibold text-black">
                          Open in Google Maps
                        </a>
                      `;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {settings?.phoneNumber && (
                  <ContactCard
                    icon={Phone}
                    label="Phone"
                    value={formattedPhone || settings.phoneNumber}
                    href={`tel:${settings.phoneNumber}`}
                  />
                )}
                {settings?.email && (
                  <ContactCard
                    icon={Mail}
                    label="Email"
                    value={settings.email}
                    href={`mailto:${settings.email}`}
                  />
                )}
              </div>

              <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl border border-line bg-white p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-full bg-[#F4B400]/10 p-2 sm:p-2.5">
                    <Clock size={16} className="text-[#F4B400] sm:size-[20px]" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B400]">Business Hours</p>
                </div>
                <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                  {businessHours.map(({ day, hours }) => (
                    <div key={day} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-body">{day}</span>
                      <span className="font-medium text-ink">{hours}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div 
                variants={scaleVariants}
                className="rounded-2xl sm:rounded-3xl border border-line bg-white p-4 sm:p-6 shadow-xl"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="rounded-full bg-[#F4B400]/10 p-2 sm:p-2.5">
                    <Sparkles size={16} className="text-[#F4B400] sm:size-[20px]" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Send Enquiry</p>
                </div>
                
                <h2 id="contact-heading" className="text-2xl sm:text-3xl font-extrabold text-ink">
                  Tell Us What You Need
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-body">
                  Fill out the form and we'll get back to you within 24 hours.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 sm:mt-6 rounded-2xl bg-green-50 border border-green-200 p-4 sm:p-6 text-center"
                  >
                    <CheckCircle size={40} className="mx-auto text-green-500 sm:size-[48px]" />
                    <h3 className="mt-2 sm:mt-3 text-base sm:text-lg font-bold text-green-700">Enquiry Sent! 🎉</h3>
                    <p className="mt-1 text-xs sm:text-sm text-green-600">
                      Thank you! Our team will contact you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    <div>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-line bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-ink placeholder:text-body/60 outline-none transition-all focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20"
                        aria-label="Your name"
                      />
                      {errors.name && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-red-500"
                        >
                          {errors.name.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register('phone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        placeholder="Phone number (10 digits)"
                        className="w-full rounded-xl border border-line bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-ink placeholder:text-body/60 outline-none transition-all focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20"
                        aria-label="Phone number"
                      />
                      {errors.phone && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-red-500"
                        >
                          {errors.phone.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register('email')}
                        placeholder="Email address (optional)"
                        className="w-full rounded-xl border border-line bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-ink placeholder:text-body/60 outline-none transition-all focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20"
                        aria-label="Email address"
                      />
                    </div>

                    <div>
                      <textarea
                        {...register('message', { required: 'Message is required' })}
                        placeholder="How can we help? (e.g., car model, budget, exchange inquiry)"
                        rows={4}
                        className="w-full rounded-xl border border-line bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-ink placeholder:text-body/60 outline-none transition-all focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 resize-none"
                        aria-label="Message"
                      />
                      {errors.message && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-red-500"
                        >
                          {errors.message.message}
                        </motion.p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 sm:gap-3 rounded-full bg-[#F4B400] px-5 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-black transition-all hover:shadow-xl hover:shadow-[#F4B400]/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="sm:size-[18px]" />
                          Send Enquiry
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 pb-8 sm:pb-16 lg:pb-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F0F10] to-[#1a1a1a] p-5 sm:p-8 shadow-2xl"
          >
            <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#F4B400] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500 rounded-full blur-3xl" />
              </div>

              <motion.div variants={itemVariants} className="relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-full bg-[#F4B400]/10 p-2 sm:p-2.5">
                    <MapPin size={16} className="text-[#F4B400] sm:size-[20px]" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Dealer Address</p>
                </div>
                <p className="mt-2 sm:mt-4 text-base sm:text-lg font-medium text-white">
                  Vasanthapuram S St Rd, Vasanth Nagar, Tirunelveli, Tamil Nadu 627005
                </p>
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                  {settings?.phoneNumber && (
                    <a 
                      href={`tel:${settings.phoneNumber}`} 
                      className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-105"
                    >
                      <Phone size={14} className="sm:size-[16px]" />
                      Call Now
                    </a>
                  )}
                  {whatsappUrl && (
                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#F4B400] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#F4B400]/25"
                    >
                      <MessageCircle size={14} className="sm:size-[16px]" />
                      WhatsApp
                    </a>
                  )}
                  <a 
                    href={fullMapUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/15 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105"
                  >
                    <MapPin size={14} className="sm:size-[16px]" />
                    Open Map
                  </a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative flex flex-col justify-center">
                <div className="flex items-center gap-2 text-white/60">
                  <Heart size={14} className="text-[#F4B400] sm:size-[16px]" />
                  <span className="text-xs sm:text-sm">We're here to help</span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/40">
                  Visit us during business hours or contact us online. We respond to all enquiries within 24 hours.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 pb-8 sm:pb-16 lg:pb-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F4B400]/10 to-[#F4B400]/5 border border-[#F4B400]/20 p-5 sm:p-8 shadow-xl"
          >
            <motion.div variants={itemVariants} className="flex flex-col items-start justify-between gap-4 sm:gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Quick Start</p>
                <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-extrabold text-ink">
                  Browse Our Inventory or Learn More
                </h2>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-body">
                  Explore our premium collection or learn about our story and values.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
                <Link
                  to="/#car-listings"
                  className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-black px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  View Cars
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 sm:size-[16px]" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-line bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-ink transition-all hover:border-[#F4B400] hover:scale-105 active:scale-95"
                >
                  About Us
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}