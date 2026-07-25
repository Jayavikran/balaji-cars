import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ title }: { title: string }) {
  const { admin } = useAuth();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-line flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="font-display font-bold text-lg text-ink">{title}</h1>
        <p className="text-xs text-body">{today}</p>
      </div>

      <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-2.5 border-l border-line pl-4">
          <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-display font-semibold text-sm">
            {admin?.name?.slice(0, 1).toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-ink leading-tight">{admin?.name}</p>
            <p className="text-xs text-body leading-tight capitalize">{admin?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
