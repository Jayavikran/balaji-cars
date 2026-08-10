import { Link } from 'react-router-dom';
import { Home, Search, ArrowRight } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Seo title="Page Not Found" noindex />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="text-center max-w-md">
          <p className="font-display text-6xl sm:text-7xl font-bold text-navy/10">404</p>
          <h1 className="mt-2 font-display text-xl sm:text-2xl font-bold text-ink">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-body">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-[1.02]"
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              to="/#car-listings"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:border-navy"
            >
              <Search size={16} />
              Browse Cars
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
