import { Facebook, Instagram, MessageCircle, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SiteSettings } from '@/types';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Cars', href: '/#car-listings' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const companyName = settings?.companyName || 'BALAJI CARS';
  const description =
    settings?.seoDescription?.trim() ||
    'A premium dealership for verified used cars, trusted pricing, and a smooth buying experience.';
  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
    : undefined;

  return (
    <footer className="mobile-footer mt-8 bg-[#0A0A0B] text-white sm:mt-12">
      <div className="premium-shell py-8 sm:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-10">
          <div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold tracking-[0.18em] text-white">
                BALAJI <span className="text-[#F4B400]">CARS</span>
              </span>
              <span className="mt-1.5 text-[0.65rem] tracking-[0.45em] text-white/70 sm:mt-2 sm:text-xs sm:tracking-[0.5em]">TIRUNELVELI</span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/68 sm:mt-5 sm:leading-7">{description}</p>

            <div className="mt-5 flex items-center gap-2.5 sm:mt-6 sm:gap-3">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/15">
                  <Facebook size={16} />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/15">
                  <Instagram size={16} />
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/15">
                  <MessageCircle size={16} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75 sm:mt-5 sm:space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                    <ChevronRight size={14} className="text-[#F4B400]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75 sm:mt-5 sm:space-y-3">
              {settings?.phoneNumber && (
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 text-[#F4B400]" />
                  <span>{settings.phoneNumber}</span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 text-[#F4B400]" />
                  <span>{settings.email}</span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-[#F4B400]" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-white/45 sm:mt-12 sm:pt-5">
          Copyright {new Date().getFullYear()} {companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
