// src/components/public/CompareBar.tsx
import { Link } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-black border-t border-line dark:border-white/10 shadow-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GitCompare size={20} className="text-[#F4B400]" />
          <span className="text-sm font-medium text-ink dark:text-white">
            {compareList.length} car{compareList.length > 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearCompare}
            className="text-xs text-body hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F4B400] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#f7c233] transition-all hover:scale-105"
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}