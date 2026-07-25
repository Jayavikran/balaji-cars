import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="flex min-h-screen bg-surface relative">
      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[#111a2c] shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-ink dark:text-white" />
      </button>

      {/* Sidebar - Full screen left drawer on mobile */}
      <div className={`
        fixed inset-0 z-50 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 sidebar-overlay bg-black/65 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`
          admin-sidebar-drawer transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-white" />
          </button>
          <Sidebar />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}