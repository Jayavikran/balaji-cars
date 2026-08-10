import { useMemo, useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  Heart,
  Check,
  AlertCircle,
  ExternalLink,
  CarFront,
  BadgeCheck,
  type LucideIcon
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { submitEnquiry } from '@/api/enquiries';

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
      duration: 0.5,
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
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Premium Quick Contact Action Card
const ContactActionCard = ({ 
  icon: Icon, 
  label, 
  value, 
  href,
  subtext,
  badgeText,
  isPrimary = false
}: { 
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  subtext?: string;
  badgeText?: string;
  isPrimary?: boolean;
}) => {
  const content = (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25 }}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 p-5 sm:p-6 shadow-md hover:shadow-xl ${
        isPrimary 
          ? 'bg-gradient-to-br from-[#121214] to-[#1c1c20] border-[#F4B400]/30 text-white hover:border-[#F4B400]/60' 
          : 'bg-white border-line hover:border-[#F4B400]/40'
      }`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-[#F4B400]/10 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className={`rounded-2xl p-3 transition-all duration-300 ${
          isPrimary ? 'bg-[#F4B400]/20 text-[#F4B400]' : 'bg-[#F4B400]/10 text-[#F4B400] group-hover:bg-[#F4B400] group-hover:text-black'
        }`}>
          <Icon size={22} />
        </div>
        {badgeText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F4B400]/15 border border-[#F4B400]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#F4B400] tracking-wider uppercase">
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#F4B400]">
          {label}
        </p>
        <p className={`mt-1 text-base sm:text-lg font-bold transition-colors ${
          isPrimary ? 'text-white group-hover:text-[#F4B400]' : 'text-ink group-hover:text-[#F4B400]'
        }`}>
          {value}
        </p>
        {subtext && (
          <p className={`mt-1 text-xs ${isPrimary ? 'text-white/60' : 'text-body'}`}>
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a 
        href={href} 
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        className="block focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded-2xl sm:rounded-3xl"
      >
        {content}
      </a>
    );
  }
  return content;
};

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();
  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors, isSubmitSuccessful } } = useForm<ContactFormValues>();
  const [submitted, setSubmitted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });

  const siteName = settings?.companyName || 'BALAJI CARS';
  const seoTitle = `Contact ${siteName} | Premium Used Car Dealership`;
  const seoDescription = `Contact ${siteName} in Tirunelveli for verified used car sales, dealership visits, test drives, finance assistance, and customer support.`;

  const mapSrc = 'https://www.google.com/maps/embed?q=Balaji+Cars+Tirunelveli';
  const fullMapUrl = 'https://www.google.com/maps/place/Balaji+Cars/@8.7029214,77.7217774,15z';

  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
    : undefined;

  const formattedPhone = settings?.phoneNumber 
    ? settings.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    : null;

  // Live Dealership Open Status
  const [isOpenNow, setIsOpenNow] = useState(true);
  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hour = now.getHours();
      if (day === 0) {
        setIsOpenNow(hour >= 10 && hour < 18);
      } else {
        setIsOpenNow(hour >= 9 && hour < 20);
      }
    };
    checkOpenStatus();
    const timer = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitEnquiry({
        carId: '',
        customerName: values.name,
        phone: values.phone,
        email: values.email,
        message: values.message,
      });
      toast.success('Enquiry submitted successfully! Our team will contact you shortly.');
      reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to submit enquiry. Please check your information and try again.';
      toast.error(errorMessage);
    }
  };

  const businessHours = [
    { day: 'Monday - Saturday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 6:00 PM' },
  ];

  const trustStats = [
    { icon: ShieldCheck, value: '20+', label: 'Years Experience', color: '#F4B400' },
    { icon: Users, value: '10,000+', label: 'Happy Customers', color: '#3B82F6' },
    { icon: Star, value: '4.9 ★', label: 'Customer Rating', color: '#10B981' },
    { icon: Award, value: '100%', label: 'RC Transfer Support', color: '#8B5CF6' },
  ];

  // Watch field values for active input highlights
  const watchName = watch('name');
  const watchPhone = watch('phone');
  const watchMessage = watch('message');

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <Seo title={seoTitle} description={seoDescription} canonical="/contact" />
      <Header settings={settings} showSearchBar={false} />

      {/* ===== HERO SECTION ===== */}
      <header className="relative overflow-hidden bg-black text-white py-16 sm:py-24 lg:py-28 flex items-center" role="banner">
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/images/banner4.png" type="image/jpeg" />
            <img 
              src="/images/banner4.png" 
              alt={`Contact ${siteName} - Premium car dealership`} 
              className="h-full w-full object-cover object-center opacity-70" 
              loading="eager" 
              decoding="async" 
            />
          </picture>
          
          {/* Studio Vignette & Atmospheric Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,180,0,0.14),transparent_50%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-center sm:text-left"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F4B400]/30 bg-gradient-to-r from-[#F4B400]/20 to-transparent backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#F4B400] shadow-sm"
            >
              <Sparkles size={14} className="text-[#F4B400]" />
              Dealership Support & Enquiries
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              Let Us Help You Find
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F4B400] via-[#FFD700] to-[#F59E0B]">
                Your Perfect Vehicle
              </span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/85 mx-auto sm:mx-0 font-normal"
            >
              Have a question about a car, loan financing, or vehicle exchange? Connect with our expert team directly via phone, WhatsApp, email, or visit our Tirunelveli showroom.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3.5"
            >
              <a
                href="#contact-form"
                className="group relative overflow-hidden inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-7 py-3.5 text-sm font-bold text-black shadow-[0_16px_40px_rgba(244,180,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(244,180,0,0.4)] active:scale-[0.98]"
              >
                <span>Send Enquiry</span>
                <Send size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg"
                >
                  <MessageCircle size={18} className="text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1">

        {/* Trust Badges Bar */}
        <section ref={statsRef} className="container mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {trustStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={scaleVariants}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-white border border-line p-4 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[#F4B400]/30"
                >
                  <div className="flex justify-center">
                    <div className="rounded-full bg-[#F4B400]/10 p-2.5">
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="mt-2 text-xl sm:text-2xl font-extrabold text-ink">{stat.value}</p>
                  <p className="text-xs font-medium text-body mt-0.5">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Quick Contact Cards */}
        <section className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400]">
              Direct Assistance
            </p>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-ink">
              Choose How You'd Like to Connect
            </h2>
            <p className="mt-2 text-sm text-body">
              Our sales advisors are available during business hours to provide vehicle history details, arrange test drives, and answer your queries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {settings?.phoneNumber && (
              <ContactActionCard
                icon={Phone}
                label="Phone Support"
                value={formattedPhone || settings.phoneNumber}
                subtext="Direct line for immediate inventory questions"
                badgeText="Call Direct"
                href={`tel:${settings.phoneNumber}`}
              />
            )}
            {whatsappUrl && (
              <ContactActionCard
                icon={MessageCircle}
                label="Instant WhatsApp"
                value="Click to Chat"
                subtext="Quick response for photos, RC & price estimates"
                badgeText="Fastest"
                href={whatsappUrl}
                isPrimary={true}
              />
            )}
            {settings?.email && (
              <ContactActionCard
                icon={Mail}
                label="Official Email"
                value={settings.email}
                subtext="Send formal documents or business queries"
                badgeText="Email"
                href={`mailto:${settings.email}`}
              />
            )}
          </div>
        </section>

        {/* Form and Map Grid Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12" aria-labelledby="contact-heading">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start"
          >
            
            {/* Left: Premium Contact Form */}
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
                {/* Subtle Form Accent Header */}
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-line mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="rounded-full bg-[#F4B400]/15 p-1.5">
                        <Sparkles size={16} className="text-[#F4B400]" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Enquiry Form</p>
                    </div>
                    <h2 id="contact-heading" className="text-2xl sm:text-3xl font-extrabold text-ink">
                      Tell Us What You Need
                    </h2>
                  </div>
                  <BadgeCheck size={32} className="text-[#F4B400] opacity-30 hidden sm:block" />
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={36} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-ink">Enquiry Submitted! 🎉</h3>
                    <p className="mt-2 text-sm text-body max-w-md mx-auto">
                      Thank you for contacting <span className="font-semibold text-ink">{siteName}</span>. Our senior automotive consultant will call or WhatsApp you within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-2.5 text-xs font-semibold text-ink hover:border-[#F4B400] transition-colors"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Full Name Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('name', { 
                            required: 'Please enter your full name',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' }
                          })}
                          placeholder="e.g. Rahul Sharma"
                          className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-ink placeholder:text-body/50 outline-none transition-all duration-200 ${
                            errors.name 
                              ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400/20' 
                              : watchName 
                              ? 'border-emerald-500/50 bg-white focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20'
                              : 'border-line bg-white focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20'
                          }`}
                          aria-invalid={errors.name ? 'true' : 'false'}
                        />
                        {watchName && !errors.name && (
                          <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                        )}
                      </div>
                      {errors.name && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium"
                        >
                          <AlertCircle size={13} />
                          {errors.name.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: 'Please enter a valid 10-digit mobile number'
                            }
                          })}
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-ink placeholder:text-body/50 outline-none transition-all duration-200 ${
                            errors.phone 
                              ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400/20' 
                              : watchPhone && watchPhone.length === 10
                              ? 'border-emerald-500/50 bg-white focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20'
                              : 'border-line bg-white focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20'
                          }`}
                          aria-invalid={errors.phone ? 'true' : 'false'}
                        />
                        {watchPhone && watchPhone.length === 10 && !errors.phone && (
                          <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                        )}
                      </div>
                      {errors.phone ? (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium"
                        >
                          <AlertCircle size={13} />
                          {errors.phone.message}
                        </motion.p>
                      ) : (
                        <p className="mt-1 text-[11px] text-body/70">
                          We will call or WhatsApp you on this number.
                        </p>
                      )}
                    </div>

                    {/* Email Input (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                        Email Address <span className="text-body/50 font-normal">(Optional)</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-sm text-ink placeholder:text-body/50 outline-none transition-all focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20"
                      />
                    </div>

                    {/* Message Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                        Message / Vehicle Requirement <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('message', { 
                          required: 'Please enter your message or vehicle preference',
                          minLength: { value: 5, message: 'Message must be at least 5 characters' }
                        })}
                        rows={4}
                        placeholder="Tell us what model, budget, transmission, or fuel type you are looking for..."
                        className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-ink placeholder:text-body/50 outline-none transition-all duration-200 resize-none ${
                          errors.message 
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400/20' 
                            : watchMessage 
                            ? 'border-emerald-500/50 bg-white focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20'
                            : 'border-line bg-white focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20'
                        }`}
                        aria-invalid={errors.message ? 'true' : 'false'}
                      />
                      {errors.message && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium"
                        >
                          <AlertCircle size={13} />
                          {errors.message.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative overflow-hidden inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] px-7 py-4 text-sm font-bold text-black shadow-[0_12px_35px_rgba(244,180,0,0.25)] transition-all hover:shadow-[0_18px_45px_rgba(244,180,0,0.38)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          <span>Sending Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} className="transition-transform group-hover:translate-x-1" />
                          <span>Submit Enquiry</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right: Map & Business Info Stack */}
            <motion.div variants={itemVariants} className="order-1 lg:order-2 space-y-6">
              
              {/* Business Hours & Live Status Card */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-line mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-full bg-[#F4B400]/10 p-2 text-[#F4B400]">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F4B400]">Showroom Hours</p>
                      <h3 className="text-lg font-bold text-ink">Business Timing</h3>
                    </div>
                  </div>

                  {/* Live Open / Closed Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isOpenNow 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {isOpenNow ? 'Open Now' : 'Closed Now'}
                  </div>
                </div>

                <div className="space-y-3">
                  {businessHours.map(({ day, hours }) => (
                    <div key={day} className="flex justify-between items-center text-sm py-1 border-b border-line/40 last:border-0">
                      <span className="font-medium text-ink">{day}</span>
                      <span className="font-semibold text-body bg-surface px-3 py-1 rounded-full text-xs">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Polished Location Map Container */}
              <div className="rounded-3xl border border-line bg-white shadow-xl overflow-hidden relative">
                <div className="p-4 bg-gradient-to-r from-[#121214] to-[#1c1c20] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-full bg-[#F4B400]/20 p-2 text-[#F4B400]">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F4B400]">Showroom Location</p>
                      <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">Tirunelveli, Tamil Nadu</p>
                    </div>
                  </div>
                  <a
                    href={fullMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F4B400] hover:underline"
                  >
                    <span>Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <iframe
                  title={`${siteName} location map`}
                  src={mapSrc}
                  className="h-[18rem] sm:h-[22rem] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  onError={(e) => {
                    const iframe = e.currentTarget;
                    iframe.style.display = 'none';
                    const parent = iframe.parentNode;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'h-[18rem] sm:h-[22rem] flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-6 text-center';
                      fallback.innerHTML = `
                        <p class="text-lg font-bold text-ink">📍 ${siteName}</p>
                        <p class="text-xs text-body mt-1 max-w-xs">Vasanthapuram S St Rd, Vasanth Nagar, Tirunelveli, Tamil Nadu 627005</p>
                        <a href="${fullMapUrl}" target="_blank" rel="noreferrer" class="mt-4 inline-block rounded-full bg-[#F4B400] px-5 py-2 text-xs font-bold text-black">
                          Open in Google Maps
                        </a>
                      `;
                      parent.appendChild(fallback);
                    }
                  }}
                />

                <div className="p-4 bg-surface border-t border-line">
                  <p className="text-xs text-body font-medium">
                    📍 Vasanthapuram S St Rd, Vasanth Nagar, Tirunelveli, Tamil Nadu 627005
                  </p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </section>

        {/* Showroom Visit CTA Banner */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="rounded-3xl bg-gradient-to-br from-[#121214] via-[#1a1a20] to-[#0f0f12] border border-[#F4B400]/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4B400]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F4B400]/15 border border-[#F4B400]/30 px-3 py-1 text-xs font-bold text-[#F4B400] tracking-wider uppercase mb-3">
                  <CarFront size={14} /> Visit Our Showroom
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Want to Test Drive a Certified Car?
                </h2>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">
                  Walk in during business hours or call us to schedule a personalized vehicle inspection & test drive with our car experts.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                {settings?.phoneNumber && (
                  <a
                    href={`tel:${settings.phoneNumber}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F4B400] px-7 py-3.5 text-sm font-bold text-black shadow-lg hover:scale-105 transition-all"
                  >
                    <Phone size={16} />
                    <span>Call Us Now</span>
                  </a>
                )}
                <Link
                  to="/#car-listings"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all"
                >
                  <span>Explore Cars</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer settings={settings} />
    </div>
  );
}