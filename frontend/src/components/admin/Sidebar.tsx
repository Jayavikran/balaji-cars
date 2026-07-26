import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Car, Upload, ListChecks, Star, CheckCircle2,
  MessageSquare, Settings as SettingsIcon, LogOut, BarChart3, X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/upload', label: 'Upload Car', icon: Upload },
  { to: '/admin/cars', label: 'Manage Cars', icon: ListChecks },
  { to: '/admin/cars?featuredOnly=true', label: 'Featured Cars', icon: Star },
  { to: '/admin/cars?status=Sold', label: 'Sold Cars', icon: CheckCircle2 },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  /** Mobile-only: controls the full-screen drawer. Ignored on desktop,
   * where the sidebar is always visible (unchanged behaviour). */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();

  return (
    <>
      <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center text-white font-display font-bold text-sm">CC</div>
        <span className="font-display font-bold text-white text-lg">BALAJI CARS</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-5 border-t border-white/10 shrink-0">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3.5 py-3 md:py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: persistent sidebar, unchanged */}
      <aside className="hidden md:flex w-64 bg-navy min-h-screen flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: full-screen left drawer, closed by default */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/65"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 h-full w-[280px] bg-navy flex flex-col shadow-cardHover"
            >
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="absolute top-4 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
              <SidebarContent onNavigate={onMobileClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
