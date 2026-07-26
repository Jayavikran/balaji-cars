import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  const { admin } = useAuth();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-14 md:h-16 bg-white/90 backdrop-blur-md border-b border-line flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-ink hover:bg-surface shrink-0"
        >
          <Menu size={21} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-base md:text-lg text-ink truncate">{title}</h1>
          <p className="hidden sm:block text-xs text-body">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
          <input
            placeholder="Search..."
            className="bg-surface rounded-full pl-9 pr-4 py-2 text-sm w-56 border border-transparent focus:border-navy focus:bg-white transition-colors"
          />
        </div>

        <button className="relative w-9 h-9 rounded-full hover:bg-surface flex items-center justify-center" aria-label="Notifications">
          <Bell size={18} className="text-ink" />
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 border-l border-line pl-4">
          <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-display font-semibold text-sm">
            {admin?.name?.slice(0, 1).toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-ink leading-tight">{admin?.name}</p>
            <p className="text-xs text-body leading-tight capitalize">{admin?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
