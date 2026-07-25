import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Car, Upload, ListChecks, Star, CheckCircle2,
  MessageSquare, Settings as SettingsIcon, LogOut, BarChart3,
} from 'lucide-react';
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

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-navy min-h-screen flex flex-col shrink-0">
      <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center text-white font-display font-bold text-sm">CC</div>
        <span className="font-display font-bold text-white text-lg">BALAJI CARS</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-5 border-t border-white/10">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );
}
