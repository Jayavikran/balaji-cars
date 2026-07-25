import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import type { SiteSettings } from '@/types';

export default function Footer({ settings }: { settings?: SiteSettings }) {
  return (
    <footer className="bg-navy text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
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
            <li>Featured Cars</li>
            <li>Latest Arrivals</li>
            <li>Available Cars</li>
            <li>Customer Reviews</li>
            <li>FAQ</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {settings?.companyName || 'BALAJI CARS'}. All rights reserved.
      </div>
    </footer>
  );
}
