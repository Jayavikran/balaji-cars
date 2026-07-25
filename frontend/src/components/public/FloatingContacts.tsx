import { useEffect, useState } from 'react';
import { MessageCircle, Instagram, Phone, ArrowUp } from 'lucide-react';
import type { SiteSettings } from '@/types';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function FloatingContacts({ settings }: { settings?: SiteSettings }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contactButtons = settings
    ? [
        {
          key: 'instagram',
          href: settings.instagramUrl,
          icon: Instagram,
          tooltip: 'Follow us on Instagram',
          gradient: 'from-pink-500 via-red-500 to-yellow-400',
        },
        {
          key: 'whatsapp',
          href: settings.whatsappNumber
            ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I have a question about a car listing')}`
            : undefined,
          icon: MessageCircle,
          tooltip: 'Chat on WhatsApp',
          gradient: 'from-emerald-400 to-emerald-600',
        },
        {
          key: 'phone',
          href: settings.phoneNumber ? `tel:${settings.phoneNumber}` : undefined,
          icon: Phone,
          tooltip: 'Call the dealership',
          gradient: 'from-navy-light to-navy',
        },
      ].filter((b) => b.href)
    : [];

  return (
    <div className="fixed right-5 bottom-6 z-40 flex flex-col gap-3">
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-cardHover bg-navy dark:bg-white/10 dark:backdrop-blur-sm hover:scale-110 transition-transform duration-200"
        >
          <ArrowUp size={19} />
        </button>
      )}

      <ThemeToggle />

      {contactButtons.map((b) => (
        <a
          key={b.key}
          href={b.href}
          target="_blank"
          rel="noreferrer"
          className="group relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-cardHover hover:scale-110 transition-transform duration-200"
        >
          <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${b.gradient}`} />
          <b.icon size={20} className="relative z-10" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-navy text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {b.tooltip}
          </span>
        </a>
      ))}
    </div>
  );
}
