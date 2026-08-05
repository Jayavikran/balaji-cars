// src/components/public/CarList.tsx
import { memo } from 'react';
import CarCard from './CarCard';
import { Car } from '@/types';

interface CarListProps {
  cars: Car[];
  isLoading: boolean;
  totalCount: number;
  loadMore: () => void;
  hasMore: boolean;
}

const CarList = memo(({ cars, isLoading, totalCount, loadMore, hasMore }: CarListProps) => {
  // Show skeleton while loading
  if (isLoading && cars.length === 0) {
    return <SkeletonGrid count={6} />;
  }

  // Empty state
  if (!isLoading && cars.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-line bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-body">No cars found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cars.map((car, index) => (
          <CarCard
            key={car._id}
            car={car}
            badge={index === 0 && car.isFeatured ? 'Featured' : undefined}
            priority={index < 3}
          />
        ))}
      </div>

      {/* Loading more skeletons */}
      {isLoading && cars.length > 0 && (
        <div className="mt-8">
          <SkeletonGrid count={4} />
        </div>
      )}

      {/* Load More button */}
      {hasMore && !isLoading && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-8 py-3 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            Load More
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && cars.length > 0 && (
        <p className="mt-8 text-center text-sm text-body">
          You've seen all {totalCount} cars
        </p>
      )}
    </div>
  );
});

const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-3xl border border-line bg-white p-4 animate-pulse">
        <div className="aspect-[4/3] rounded-xl bg-gray-200" />
        <div className="mt-4 space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-7 w-1/3 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default CarList;