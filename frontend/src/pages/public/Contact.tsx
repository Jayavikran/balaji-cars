import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Phone, Send } from 'lucide-react';
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

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<ContactFormValues>();

  const siteName = settings?.companyName || 'BALAJI CARS';
  const seoTitle = `Contact ${siteName} | Premium Used Cars`;
  const seoDescription = `Contact ${siteName} in Tirunelveli for used car enquiries, dealership visits, and support with finance or vehicle details.`;

  const mapSrc = useMemo(() => {
    if (settings?.address) return `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`;
    if (settings?.googleMapsLink) return settings.googleMapsLink;
    return 'https://www.google.com/maps?q=Tirunelveli&output=embed';
  }, [settings?.address, settings?.googleMapsLink]);

  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
    : undefined;

  const onSubmit = async (values: ContactFormValues) => {
    const body = [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : '',
      '',
      values.message,
    ].filter(Boolean).join('\n');

    if (settings?.email) {
      window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(`${siteName} enquiry`)}&body=${encodeURIComponent(body)}`;
      toast.success('Opening your email app.');
      reset();
      return;
    }

    toast.error('Contact details are not available right now.');
  };

  return (
    <div className="mobile-page min-h-screen flex flex-col bg-white">
      <Seo title={seoTitle} description={seoDescription} />
      <Header settings={settings} showSearchBar={false} />

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img src="/images/banner2.jpeg" alt="Contact Balaji Cars" className="h-full w-full object-cover opacity-55" loading="eager" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(0,0,0,.2),rgba(0,0,0,.8)_65%)]" />
        </div>
        <div className="premium-shell relative z-10 py-16 sm:py-20 lg:py-24">
          <p className="text-sm font-semibold tracking-[0.24em] text-[#F4B400]">CONTACT</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Let us help you find the right car.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
            Visit the dealership, send an enquiry, or reach us directly by phone, WhatsApp, or email.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <section className="premium-shell py-12 sm:py-16 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div id="map" className="overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
                <iframe
                  title="Balaji Cars map"
                  src={mapSrc}
                  className="h-[22rem] w-full border-0 sm:h-[30rem]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-line bg-white p-5 shadow-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                    <Phone size={20} />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B400]">Phone</p>
                  <p className="mt-2 text-base font-semibold text-ink">{settings?.phoneNumber || 'Not available'}</p>
                </div>
                <div className="rounded-[22px] border border-line bg-white p-5 shadow-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                    <Mail size={20} />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B400]">Email</p>
                  <p className="mt-2 text-base font-semibold text-ink">{settings?.email || 'Not available'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-line bg-white p-6 shadow-card">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Send Enquiry</p>
                <h2 className="mt-3 text-3xl font-extrabold text-ink">Tell us what you need.</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <div>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Your name"
                      className="input"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="Phone number"
                      className="input"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <input {...register('email')} placeholder="Email (optional)" className="input" />
                  <div>
                    <textarea
                      {...register('message', { required: 'Message is required' })}
                      placeholder="How can we help?"
                      rows={6}
                      className="input resize-none"
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F4B400] px-5 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </form>
              </div>

              <div className="rounded-[28px] bg-[#0F0F10] p-6 text-white shadow-card">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Dealer Address</p>
                <p className="mt-3 text-base leading-7 text-white/82">{settings?.address || 'Address not available'}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {settings?.phoneNumber && (
                    <a href={`tel:${settings.phoneNumber}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/15">
                      Call Now
                    </a>
                  )}
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#F4B400] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#f7c233]">
                      WhatsApp
                    </a>
                  )}
                  {settings?.address && (
                    <a href={settings.googleMapsLink || `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                      Open Map
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="premium-shell pb-14 sm:pb-16 lg:pb-20">
          <div className="rounded-[28px] bg-surface p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Need a quick start?</p>
                <h2 className="mt-3 text-3xl font-extrabold text-ink">Browse the current inventory or learn more about us.</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/#car-listings" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E1E20]">
                  View Cars
                </Link>
                <Link to="/about" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#F4B400]">
                  About Us
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
