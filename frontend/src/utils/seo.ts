import type { Car, SiteSettings } from '@/types';

export const SITE_NAME = 'BALAJI CARS';
export const DEFAULT_CITY = 'Tirunelveli';

export function getSiteOrigin() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return '';
}

export function resolveAbsoluteUrl(url?: string, base = getSiteOrigin()) {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  if (!base) return url;
  return new URL(url, base).toString();
}

function compactPrice(price?: number) {
  if (!price) return '';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} crore`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} lakh`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatKm(value?: number) {
  if (value === undefined || value === null) return '';
  return `${value.toLocaleString('en-IN')} km`;
}

export function getCarDisplayName(car: Pick<Car, 'brand' | 'model' | 'variant' | 'manufacturingYear'>) {
  return [car.manufacturingYear, car.brand, car.model, car.variant].filter(Boolean).join(' ');
}

export function buildCarSeoTitle(car: Pick<Car, 'brand' | 'model' | 'variant' | 'manufacturingYear'>) {
  return `${getCarDisplayName(car)} | Used Car in ${DEFAULT_CITY}`;
}

export function buildCarSeoDescription(
  car: Pick<Car, 'brand' | 'model' | 'variant' | 'manufacturingYear' | 'kilometersDriven' | 'fuelType' | 'transmission' | 'location' | 'price' | 'description'>
) {
  const name = getCarDisplayName(car);
  const parts = [
    `${name} available at BALAJI CARS in ${DEFAULT_CITY}.`,
    car.location ? `Listed in ${car.location}.` : '',
    car.kilometersDriven !== undefined ? `${formatKm(car.kilometersDriven)} driven.` : '',
    car.fuelType ? `${car.fuelType} ${car.transmission || ''}`.trim() : '',
    car.price ? `Priced at ${compactPrice(car.price)}.` : '',
    'View photos, specifications, and enquiry options on the listing page.',
  ];

  return parts.filter(Boolean).join(' ');
}

export function buildCarBreadcrumbItems(car: Pick<Car, 'brand' | 'model' | 'variant' | 'manufacturingYear'>) {
  return [
    { label: 'Home', href: '/' },
    { label: `Used Cars in ${DEFAULT_CITY}`, href: '/#car-listings' },
    { label: getCarDisplayName(car) },
  ];
}

export function buildWebsiteSchema(origin: string, siteName = SITE_NAME) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildDealerSchema(settings: SiteSettings | undefined, origin: string, siteName = SITE_NAME) {
  const sameAs = [settings?.facebookUrl, settings?.instagramUrl, settings?.youtubeUrl].filter(Boolean) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'AutoDealer'],
    name: settings?.companyName || siteName,
    url: origin,
    logo: resolveAbsoluteUrl(settings?.companyLogo || '/images/balaji-cars-logo.png', origin),
    telephone: settings?.phoneNumber,
    email: settings?.email,
    address: settings?.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressLocality: DEFAULT_CITY,
          addressRegion: 'Tamil Nadu',
          addressCountry: 'IN',
        }
      : undefined,
    sameAs,
  };
}

export function buildCarProductSchema(
  car: Car,
  origin: string,
  siteName = SITE_NAME
) {
  const carName = getCarDisplayName(car);
  const images = (car.images?.length ? car.images : [{ url: '/images/placeholder-car.jpg' }]).map((img) =>
    resolveAbsoluteUrl(img.url, origin)
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: carName,
    description: buildCarSeoDescription(car),
    image: images,
    sku: car.slug || `${car.brand}-${car.model}-${car.manufacturingYear}`,
    brand: {
      '@type': 'Brand',
      name: car.brand,
    },
    model: car.model,
    category: 'Used Car',
    itemCondition: 'https://schema.org/UsedCondition',
    productionDate: String(car.manufacturingYear),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Fuel Type',
        value: car.fuelType,
      },
      {
        '@type': 'PropertyValue',
        name: 'Transmission',
        value: car.transmission,
      },
      {
        '@type': 'PropertyValue',
        name: 'Kilometers Driven',
        value: car.kilometersDriven ? `${car.kilometersDriven.toLocaleString('en-IN')} km` : undefined,
      },
      {
        '@type': 'PropertyValue',
        name: 'Location',
        value: car.location,
      },
      {
        '@type': 'PropertyValue',
        name: 'Seller',
        value: siteName,
      },
    ].filter(Boolean),
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'INR',
      availability:
        car.status === 'Available'
          ? 'https://schema.org/InStock'
          : car.status === 'Reserved'
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/OutOfStock',
      url: `${origin}/cars/${car.slug}`,
      seller: {
        '@type': 'Organization',
        name: siteName,
        url: origin,
      },
    },
  };
}
