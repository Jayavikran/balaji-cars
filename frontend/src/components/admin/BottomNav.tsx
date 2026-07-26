import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

const ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/cars', label: 'Cars', icon: Car },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * Mobile-only quick-access bar (the four most-used sections) mirroring the
 * bottom nav pattern in Cars24/Spinny-style apps. Desktop keeps the full
 * sidebar and never renders this.
 */
export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-emerald' : 'text-body'
              }`
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
