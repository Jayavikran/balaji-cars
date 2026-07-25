import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSimilarCars, fetchCars } from '@/api/cars';
import CarCard from './CarCard';
import type { Car } from '@/types';

interface SimilarCarsProps {
  car: Car;
}

function computeBadge(similar: Car, ref: Car): string | undefined {
  if (similar.kilometersDriven < ref.kilometersDriven * 0.6) return 'Low KM';
  if (similar.owner === '1st Owner') return 'Single Owner';
  if (similar.insuranceActive) return 'Insurance Active';
  if (similar.price < ref.price * 0.9) return 'Best Deal';
  return undefined;
}

export default function SimilarCars({ car }: SimilarCarsProps) {
  const [visibleCount, setVisibleCount] = useState(8);

  const { data, isLoading } = useQuery({
    queryKey: ['similar', car._id],
    queryFn: () => fetchSimilarCars(car._id, 24),
  });

  const { data: fallback } = useQuery({
    queryKey: ['fallback-latest'],
    queryFn: () => fetchCars({ sort: 'recently_added', pageSize: 8 }),
    enabled: !isLoading && (data?.cars.length ?? 0) === 0,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">🚗 Similar Cars You Might Like</h2>
          <p className="text-body text-sm mt-1">Based on your current selection</p>
        </div>
        {!!data?.total && (
          <p className="text-sm font-medium text-emerald-dark bg-emerald/10 rounded-full px-3 py-1.5">
            {data.total} Similar Vehicle{data.total === 1 ? '' : 's'} Available
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-card bg-surface h-80 animate-pulse" />
          ))}
        </div>
      ) : data && data.cars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:overflow-visible overflow-x-auto snap-x">
            {data.cars.slice(0, visibleCount).map((c) => (
              <div key={c._id} className="sm:w-auto w-[85vw] shrink-0 snap-start">
                <CarCard car={c} badge={computeBadge(c, car)} />
              </div>
            ))}
          </div>
          {visibleCount < data.cars.length && (
            <div className="mt-6 text-center">
              <button onClick={() => setVisibleCount((v) => v + 8)} className="btn-outline">
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 border border-dashed border-line rounded-card">
          <p className="text-body mb-4">No similar vehicles found.</p>
          {fallback && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
              {fallback.cars.map((c) => <CarCard key={c._id} car={c} />)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
