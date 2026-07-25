import { useCallback, useEffect, useState } from 'react';
import type { Car } from '@/types';

const STORAGE_KEY = 'BALAJI CARS_compare';
const MAX_COMPARE = 3;

export type CompareCar = Pick<
  Car,
  '_id' | 'brand' | 'model' | 'variant' | 'price' | 'images' | 'slug' | 'fuelType' | 'transmission'
>;

function read(): CompareCar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list: CompareCar[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('BALAJI CARS-compare-changed'));
}

export function useCompare() {
  const [compareList, setCompareList] = useState<CompareCar[]>(read);

  useEffect(() => {
    const sync = () => setCompareList(read());
    window.addEventListener('BALAJI CARS-compare-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('BALAJI CARS-compare-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isComparing = useCallback((id: string) => compareList.some((c) => c._id === id), [compareList]);

  const toggleCompare = useCallback((car: Car): 'added' | 'removed' | 'full' => {
    const current = read();
    const exists = current.some((c) => c._id === car._id);

    if (exists) {
      write(current.filter((c) => c._id !== car._id));
      setCompareList(read());
      return 'removed';
    }

    if (current.length >= MAX_COMPARE) {
      return 'full';
    }

    const next: CompareCar[] = [
      ...current,
      {
        _id: car._id, brand: car.brand, model: car.model, variant: car.variant,
        price: car.price, images: car.images, slug: car.slug,
        fuelType: car.fuelType, transmission: car.transmission,
      },
    ];
    write(next);
    setCompareList(next);
    return 'added';
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    const next = read().filter((c) => c._id !== id);
    write(next);
    setCompareList(next);
  }, []);

  const clearCompare = useCallback(() => {
    write([]);
    setCompareList([]);
  }, []);

  return { compareList, isComparing, toggleCompare, removeFromCompare, clearCompare, maxCompare: MAX_COMPARE };
}
