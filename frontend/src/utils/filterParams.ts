import type { CarFilters } from '@/api/cars';

// Query keys that are booleans on CarFilters — need string <-> boolean conversion.
const BOOLEAN_KEYS: (keyof CarFilters)[] = [
  'insuranceActiveOnly', 'fcValidOnly', 'featuredOnly', 'availableOnly',
];

// Query keys that are numbers on CarFilters.
const NUMBER_KEYS: (keyof CarFilters)[] = [
  'minPrice', 'maxPrice', 'minKm', 'maxKm', 'manufacturingYear', 'registrationYear', 'seats',
];

/**
 * Reads the "advanced" filter fields (everything the FilterDrawer controls)
 * out of the current URL so a refresh restores exactly what the user had
 * selected. Core fields (q, sort, brand, status, page) are handled
 * separately in Home.tsx since they have dedicated UI controls.
 */
export function advancedFiltersFromParams(params: URLSearchParams): CarFilters {
  const filters: CarFilters = {};

  for (const key of NUMBER_KEYS) {
    const raw = params.get(key);
    if (raw !== null && raw !== '') (filters as any)[key] = Number(raw);
  }
  for (const key of BOOLEAN_KEYS) {
    const raw = params.get(key);
    if (raw === 'true') (filters as any)[key] = true;
  }
  for (const key of ['fuelType', 'transmission', 'owner', 'bodyType', 'color', 'location'] as (keyof CarFilters)[]) {
    const raw = params.get(key);
    if (raw) (filters as any)[key] = raw;
  }

  return filters;
}

/**
 * Writes the full set of active filters into a fresh URLSearchParams
 * object, omitting anything empty/undefined/default so the URL stays
 * clean (e.g. sort=newest and page=1 are left out since they're defaults).
 */
export function paramsFromFilters(input: {
  q?: string;
  sort?: string;
  brand?: string;
  status?: CarFilters['status'];
  page?: number;
  advanced: CarFilters;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (input.q) params.set('q', input.q);
  if (input.sort && input.sort !== 'newest') params.set('sort', input.sort);
  if (input.brand && input.brand !== 'All') params.set('brand', input.brand);
  if (input.status) params.set('status', input.status);
  if (input.page && input.page > 1) params.set('page', String(input.page));

  Object.entries(input.advanced).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === false) return;
    params.set(key, String(value));
  });

  return params;
}
