import { useState } from 'react';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import type { SiteSettings } from '@/types';

const EXPLORE_LINKS = ['Featured Cars', 'Latest Arrivals', 'Available Cars', 'Customer Reviews', 'FAQ'];

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const hasSocial = !!(settings?.facebookUrl || settings?.instagramUrl || settings?.youtubeUrl);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) => setOpenSection((cur) => (cur === id ? null : id));

  return (
    <footer className="bg-navy text-white/80 mt-10 sm:mt-16">
      {/* Desktop: unchanged 3-column layout */}
      <div className="hidden md:grid max-w-7xl mx-auto px-4 sm:px-6 py-12 grid-cols-3 gap-10">
        <div>
          <h4 className="font-display font-bold text-white text-lg mb-3">{settings?.companyName || 'BALAJI CARS'}</h4>
          <p className="text-sm leading-relaxed">
            A premium marketplace for certified used cars — transparent pricing, verified listings, and direct
            dealer contact.
          </p>
          <div className="flex gap-3 mt-4">
            {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><Facebook size={16} /></a>}
            {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><Instagram size={16} /></a>}
            {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><Youtube size={16} /></a>}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2.5 text-sm">
            {settings?.address && <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> {settings.address}</li>}
            {settings?.phoneNumber && <li className="flex items-center gap-2"><Phone size={15} /> {settings.phoneNumber}</li>}
            {settings?.email && <li className="flex items-center gap-2"><Mail size={15} /> {settings.email}</li>}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white mb-3">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            {EXPLORE_LINKS.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>
      </div>

      {/* Mobile: compact accordion — About / Contact / Quick Links / Social */}
      <div className="md:hidden px-4 py-5">
        <h4 className="font-display font-bold text-white text-base mb-1">{settings?.companyName || 'BALAJI CARS'}</h4>
        <p className="text-xs text-white/60 mb-3">Quality Cars • Best Price • Trusted Dealer</p>

        <AccordionRow id="about" open={openSection === 'about'} onToggle={toggle} title="About">
          <p className="text-xs leading-relaxed text-white/70">
            A premium marketplace for certified used cars — transparent pricing, verified listings, and direct
            dealer contact.
          </p>
        </AccordionRow>

        <AccordionRow id="contact" open={openSection === 'contact'} onToggle={toggle} title="Contact">
          <ul className="space-y-2 text-xs">
            {settings?.address && <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0" /> {settings.address}</li>}
            {settings?.phoneNumber && <li className="flex items-center gap-2"><Phone size={13} /> {settings.phoneNumber}</li>}
            {settings?.email && <li className="flex items-center gap-2"><Mail size={13} /> {settings.email}</li>}
          </ul>
        </AccordionRow>

        <AccordionRow id="links" open={openSection === 'links'} onToggle={toggle} title="Quick Links">
          <ul className="space-y-2 text-xs text-white/70">
            {EXPLORE_LINKS.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </AccordionRow>

        {hasSocial && (
          <AccordionRow id="social" open={openSection === 'social'} onToggle={toggle} title="Social">
            <div className="flex gap-2.5 pt-1">
              {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"><Facebook size={15} /></a>}
              {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"><Instagram size={15} /></a>}
              {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"><Youtube size={15} /></a>}
            </div>
          </AccordionRow>
        )}
      </div>

      <div className="border-t border-white/10 py-4 sm:py-5 text-center text-[11px] sm:text-xs text-white/50">
        © {new Date().getFullYear()} {settings?.companyName || 'BALAJI CARS'}. All rights reserved.
      </div>
    </footer>
  );
}

function AccordionRow({
  id, title, open, onToggle, children,
}: {
  id: string; title: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/10 py-1">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-white"
      >
        {title}
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4 animate-fadeIn">{children}</div>}
    </div>
  );
}
