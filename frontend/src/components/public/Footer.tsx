import { 
  Facebook, Instagram, Youtube, MessageCircle, MapPin, Phone, Mail, 
  ChevronRight, Sparkles, ShieldCheck, Clock, type LucideIcon 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteSettings } from '@/types';

interface QuickLink {
  label: string;
  href: string;
}

interface SocialIcon {
  id: string;
  icon: LucideIcon;
  getUrl: (settings: SiteSettings) => string | undefined;
  label: string;
  color?: string;
}

interface FooterProps {
  settings?: SiteSettings;
  className?: string;
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Cars', href: '/#car-listings' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_ICONS: SocialIcon[] = [
  { 
    id: 'facebook', 
    icon: Facebook, 
    getUrl: (settings) => settings?.facebookUrl,
    label: 'Facebook',
    color: '#1877F2'
  },
  { 
    id: 'instagram', 
    icon: Instagram, 
    getUrl: (settings) => settings?.instagramUrl,
    label: 'Instagram',
    color: '#E4405F'
  },
  { 
    id: 'youtube', 
    icon: Youtube, 
    getUrl: (settings) => settings?.youtubeUrl,
    label: 'YouTube',
    color: '#FF0000'
  },
  { 
    id: 'whatsapp', 
    icon: MessageCircle, 
    getUrl: (settings) => settings?.whatsappNumber 
      ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
      : undefined,
    label: 'WhatsApp',
    color: '#25D366'
  },
];

const FOOTER_BADGES = [
  { icon: ShieldCheck, label: 'Certified Dealer' },
  { icon: Clock, label: '5+ Years Experience' },
  { icon: Sparkles, label: 'Verified Vehicles' },
] as const;

const SocialIconButton = memo(({ 
  icon: Icon, 
  url, 
  label, 
  color = '#FFFFFF'
}: { 
  icon: LucideIcon;
  url: string;
  label: string;
  color?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit our ${label} page`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50"
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isHovered ? 0.2 : 0,
          scale: isHovered ? 1.2 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{ background: color }}
      />
      <Icon size={15} className="relative z-10" />
    </motion.a>
  );
});

SocialIconButton.displayName = 'SocialIconButton';

const FooterLink = memo(({ to, children }: { to: string; children: React.ReactNode }) => (
  <motion.li whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
    <Link to={to} className="inline-flex items-center gap-2 transition-all duration-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded-full px-1 py-0.5">
      <ChevronRight size={13} className="text-[#F4B400] flex-shrink-0" aria-hidden="true" />
      {children}
    </Link>
  </motion.li>
));

FooterLink.displayName = 'FooterLink';

const ContactItem = memo(({ 
  icon: Icon, 
  children,
  href,
  ariaLabel
}: { 
  icon: LucideIcon;
  children: React.ReactNode;
  href?: string;
  ariaLabel?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.li 
      className="flex items-start gap-2.5"
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon size={14} className={`mt-0.5 flex-shrink-0 transition-colors duration-300 ${isHovered ? 'text-[#F4B400]' : 'text-[#F4B400]'}`} aria-hidden="true" />
      <span className="text-sm transition-colors duration-300 hover:text-white">{children}</span>
    </motion.li>
  );

  if (href) {
    return <a href={href} aria-label={ariaLabel} className="block">{content}</a>;
  }
  return content;
});

ContactItem.displayName = 'ContactItem';

const FooterBadge = memo(({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
    <Icon size={12} className="text-[#F4B400]" aria-hidden="true" />
    <span className="text-xs text-white/70">{label}</span>
  </div>
));

FooterBadge.displayName = 'FooterBadge';

const Footer = memo(function Footer({ settings, className = '' }: FooterProps) {
  const [isYearVisible, setIsYearVisible] = useState(true);

  const companyName = useMemo(() => settings?.companyName || 'BALAJI CARS', [settings]);
  const description = useMemo(() => 
    settings?.seoDescription?.trim() || 
    'A premium dealership for verified used cars, trusted pricing, and a smooth buying experience.',
    [settings]
  );
  
  const formattedPhone = useMemo(() => {
    if (!settings?.phoneNumber) return null;
    return settings.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }, [settings?.phoneNumber]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const activeSocialIcons = useMemo(() => 
    SOCIAL_ICONS.filter(({ getUrl }) => getUrl(settings as SiteSettings)),
    [settings]
  );

  const contactInfo = useMemo(() => ({
    phone: settings?.phoneNumber,
    formattedPhone,
    email: settings?.email,
    address: settings?.address,
  }), [settings, formattedPhone]);

  const handleYearHover = useCallback((visible: boolean) => {
    setIsYearVisible(visible);
  }, []);

  return (
    <footer 
      className={`bg-gradient-to-b from-[#0A0A0B] to-black text-white mt-8 sm:mt-12 ${className}`}
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="container mx-auto px-4 py-6 sm:py-10 lg:py-14">
        <div className="grid gap-6 sm:gap-8 md:gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col leading-none">
              {settings?.companyLogo ? (
                <motion.img
                  src={settings.companyLogo}
                  alt={companyName}
                  className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              ) : (
                <>
                  <span className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-[0.18em] text-white">
                    BALAJI <span className="text-[#F4B400]">CARS</span>
                  </span>
                  <span className="mt-1 text-[0.6rem] tracking-[0.45em] text-white/70 sm:mt-1.5 sm:text-xs">
                    TIRUNELVELI
                  </span>
                </>
              )}
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-3 max-w-xl text-sm leading-6 text-white/68 sm:mt-4 sm:leading-7"
            >
              {description}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-4 flex flex-wrap gap-2 sm:mt-5"
            >
              {FOOTER_BADGES.map(({ icon, label }) => (
                <FooterBadge key={label} icon={icon} label={label} />
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-4 flex items-center gap-2 sm:mt-6 sm:gap-2.5"
            >
              {activeSocialIcons.map(({ id, icon, getUrl, label, color }) => {
                const url = getUrl(settings as SiteSettings);
                if (!url) return null;
                return (
                  <SocialIconButton
                    key={id}
                    icon={icon}
                    url={url}
                    label={label}
                    color={color}
                  />
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400] sm:text-sm">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-white/75 sm:mt-4">
              {QUICK_LINKS.map((item) => (
                <FooterLink key={item.label} to={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F4B400] sm:text-sm">
              Contact Us
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-white/75 sm:mt-4">
              {contactInfo.phone && (
                <ContactItem 
                  icon={Phone}
                  href={`tel:${contactInfo.phone}`}
                  ariaLabel={`Call us at ${contactInfo.formattedPhone}`}
                >
                  {contactInfo.formattedPhone}
                </ContactItem>
              )}
              
              {contactInfo.email && (
                <ContactItem 
                  icon={Mail}
                  href={`mailto:${contactInfo.email}`}
                  ariaLabel={`Email us at ${contactInfo.email}`}
                >
                  {contactInfo.email}
                </ContactItem>
              )}
              
              {contactInfo.address && (
                <ContactItem icon={MapPin}>
                  {contactInfo.address}
                </ContactItem>
              )}
            </ul>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-4 sm:mt-5"
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-4 py-2 text-xs font-semibold text-black transition-all duration-300 hover:bg-[#f7c233] hover:scale-105 hover:shadow-lg hover:shadow-[#F4B400]/20 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                Get in Touch
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="relative mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent sm:mt-8"
        />

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-4 flex flex-col items-center justify-between gap-2 text-center text-xs text-white/40 sm:mt-6 sm:flex-row sm:text-left"
        >
          <p>&copy; {currentYear} {companyName}. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.a 
              href="#" 
              className="transition-colors hover:text-white/60 hover:underline focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded px-1"
              whileHover={{ scale: 1.05 }}
            >
              Privacy Policy
            </motion.a>
            <span className="w-px h-3 bg-white/10" aria-hidden="true" />
            <motion.a 
              href="#" 
              className="transition-colors hover:text-white/60 hover:underline focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 rounded px-1"
              whileHover={{ scale: 1.05 }}
            >
              Terms of Service
            </motion.a>
            <span className="w-px h-3 bg-white/10" aria-hidden="true" />
            <motion.span
              onHoverStart={() => handleYearHover(false)}
              onHoverEnd={() => handleYearHover(true)}
              className="flex items-center gap-1.5"
            >
              <span>❤️</span>
              <AnimatePresence mode="wait">
                {isYearVisible ? (
                  <motion.span
                    key="year"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {currentYear}
                  </motion.span>
                ) : (
                  <motion.span
                    key="made"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[#F4B400] text-xs font-medium"
                  >
                    Made with ❤️
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;