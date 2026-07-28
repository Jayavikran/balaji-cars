import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
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
    <section className="premium-shell py-12 sm:py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">More Options</p>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-ink sm:text-3xl">
            <Sparkles size={20} className="text-[#F4B400]" />
            Similar Cars You Might Like
          </h2>
          <p className="mt-1 text-sm text-body">Based on your current selection</p>
        </div>
        {!!data?.total && (
          <p className="rounded-full border border-[#F4B400]/20 bg-[#F4B400]/10 px-3 py-1.5 text-sm font-medium text-[#8A5A00]">
            {data.total} Similar Vehicle{data.total === 1 ? '' : 's'} Available
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-[22px] bg-surface" />
          ))}
        </div>
      ) : data && data.cars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.cars.slice(0, visibleCount).map((c) => (
              <div key={c._id}>
                <CarCard car={c} badge={computeBadge(c, car)} />
              </div>
            ))}
          </div>
          {visibleCount < data.cars.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount((v) => v + 8)}
                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#F4B400] hover:text-[#F4B400]"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[28px] border border-dashed border-line bg-white py-10 text-center shadow-card">
          <p className="text-body">No similar vehicles found.</p>
          {fallback && (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {fallback.cars.map((c) => <CarCard key={c._id} car={c} />)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
