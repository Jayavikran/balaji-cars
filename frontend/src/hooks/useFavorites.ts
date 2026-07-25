import { useCallback, useEffect, useState } from 'react';
import type { Car } from '@/types';

const STORAGE_KEY = 'BALAJI CARS_favorites';

type FavoriteCar = Pick<Car, '_id' | 'brand' | 'model' | 'variant' | 'price' | 'manufacturingYear' | 'location' | 'slug' | 'images'>;

function readFavorites(): FavoriteCar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: FavoriteCar[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event('BALAJI CARS-favorites-changed'));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCar[]>(readFavorites);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener('BALAJI CARS-favorites-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('BALAJI CARS-favorites-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isFavorite = useCallback((id: string) => favorites.some((f) => f._id === id), [favorites]);

  const toggleFavorite = useCallback((car: Car) => {
    const current = readFavorites();
    const exists = current.some((f) => f._id === car._id);
    const next = exists
      ? current.filter((f) => f._id !== car._id)
      : [
          ...current,
          {
            _id: car._id,
            brand: car.brand,
            model: car.model,
            variant: car.variant,
            price: car.price,
            manufacturingYear: car.manufacturingYear,
            location: car.location,
            slug: car.slug,
            images: car.images,
          },
        ];
    writeFavorites(next);
    setFavorites(next);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const next = readFavorites().filter((f) => f._id !== id);
    writeFavorites(next);
    setFavorites(next);
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
