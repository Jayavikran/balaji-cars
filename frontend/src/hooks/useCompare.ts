// src/hooks/useCompare.ts
import { useCallback, useEffect, useState } from 'react';

// Define the Car type matching your backend
export interface Car {
  _id: string;
  brand: string;
  model: string;
  variant?: string;
  price: number;
  images?: Array<{ url: string }>;
  slug: string;
  fuelType: string;
  transmission: string;
  location?: string;
  manufacturingYear?: number;
  mileage?: number;
  engineCC?: number;
  power?: number;
  seats?: number;
  owner?: string;
  kilometersDriven?: number;
  registrationYear?: number;
  insuranceActive?: boolean;
  features?: string[];
  description?: string;
}

export type CompareCar = Pick<
  Car,
  '_id' | 'brand' | 'model' | 'variant' | 'price' | 'images' | 'slug' | 'fuelType' | 'transmission'
>;

const STORAGE_KEY = 'balaji-cars-compare';
const STORAGE_EVENT = 'compare-changed';
const MAX_COMPARE = 3;

function read(): CompareCar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Error reading compare list:', error);
    return [];
  }
}

function write(list: CompareCar[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (error) {
    console.warn('Error writing compare list:', error);
  }
}

export function useCompare() {
  const [compareList, setCompareList] = useState<CompareCar[]>(read);

  useEffect(() => {
    const sync = () => {
      try {
        setCompareList(read());
      } catch (error) {
        console.warn('Error syncing compare list:', error);
      }
    };
    
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener('storage', sync);
    
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isComparing = useCallback((id: string) => {
    if (!id) return false;
    return compareList.some((c) => c._id === id);
  }, [compareList]);

  const toggleCompare = useCallback((car: Car): 'added' | 'removed' | 'full' => {
    if (!car || !car._id) {
      console.warn('Invalid car object provided to toggleCompare');
      return 'removed';
    }

    try {
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
          _id: car._id,
          brand: car.brand || 'Unknown',
          model: car.model || 'Unknown',
          variant: car.variant || '',
          price: car.price || 0,
          images: car.images || [],
          slug: car.slug || '',
          fuelType: car.fuelType || 'N/A',
          transmission: car.transmission || 'N/A',
        },
      ];
      write(next);
      setCompareList(next);
      return 'added';
    } catch (error) {
      console.warn('Error toggling compare:', error);
      return 'removed';
    }
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    if (!id) return;
    
    try {
      const next = read().filter((c) => c._id !== id);
      write(next);
      setCompareList(next);
    } catch (error) {
      console.warn('Error removing from compare:', error);
    }
  }, []);

  const clearCompare = useCallback(() => {
    try {
      write([]);
      setCompareList([]);
    } catch (error) {
      console.warn('Error clearing compare:', error);
    }
  }, []);

  return { 
    compareList, 
    isComparing, 
    toggleCompare, 
    removeFromCompare, 
    clearCompare, 
    maxCompare: MAX_COMPARE 
  };
}