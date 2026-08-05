import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';

// ============================================
// TYPES
// ============================================

interface SeoProps {
  /** Page title (will have site name appended automatically) */
  title: string;
  /** Meta description for SEO */
  description?: string;
  /** Open Graph / Twitter image URL */
  image?: string;
  /** Open Graph type */
  type?: 'website' | 'article' | 'product' | 'profile';
  /** Whether to noindex the page */
  noindex?: boolean;
  /** Custom site name (defaults to 'BALAJI CARS') */
  siteName?: string;
  /** Additional meta tags */
  additionalMeta?: Array<{ name?: string; property?: string; content: string }>;
  /** Additional link tags */
  additionalLinks?: Array<{ rel: string; href: string; [key: string]: string }>;
  /** One or more JSON-LD objects */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Preconnect URLs for performance */
  preconnect?: string[];
  /** Custom canonical URL (overrides auto-generated) */
  canonical?: string; // ✅ added
  /** Open Graph data as an object (overrides image, type if provided) */
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{ url: string; alt?: string }>;
    url?: string;
    type?: string;
  };
}

// ============================================
// DEFAULT SITE CONFIG
// ============================================

const DEFAULT_SITE_NAME = 'BALAJI CARS';
const DEFAULT_IMAGE = '/images/og-image.jpg';
const DEFAULT_DESCRIPTION = 'Premium certified used cars with transparent pricing and verified quality.';

// ============================================
// MAIN SEO COMPONENT
// ============================================

/**
 * Centralized SEO component that handles:
 * - Title & meta description
 * - Canonical URL (with query params stripped)
 * - Open Graph & Twitter Cards
 * - JSON-LD structured data
 * - Preconnect hints for performance
 * - Additional meta/link tags
 */
export default function Seo({
  title,
  description,
  image,
  type = 'website',
  noindex = false,
  siteName = DEFAULT_SITE_NAME,
  additionalMeta = [],
  additionalLinks = [],
  jsonLd,
  preconnect = [],
  canonical: customCanonical,
  openGraph,
}: SeoProps) {
  // ===== Memoized Values =====
  
  const canonicalUrl = useMemo(() => {
    if (customCanonical) return customCanonical;
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}`;
  }, [customCanonical]);

  const fullTitle = useMemo(() => {
    return `${title} | ${siteName}`;
  }, [title, siteName]);

  const metaDescription = useMemo(() => {
    return description || DEFAULT_DESCRIPTION;
  }, [description]);

  // Use openGraph data if provided
  const ogTitle = openGraph?.title || fullTitle;
  const ogDescription = openGraph?.description || metaDescription;
  const ogImage = openGraph?.images?.[0]?.url || image || DEFAULT_IMAGE;
  const ogType = openGraph?.type || type;
  const ogUrl = openGraph?.url || canonicalUrl;

  const jsonLdList = useMemo(() => {
    if (!jsonLd) return [];
    return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  }, [jsonLd]);

  // ===== Helper Functions =====

  const renderMeta = (meta: { name?: string; property?: string; content: string }) => {
    if (meta.name) {
      return <meta key={meta.name} name={meta.name} content={meta.content} />;
    }
    if (meta.property) {
      return <meta key={meta.property} property={meta.property} content={meta.content} />;
    }
    return null;
  };

  const renderLink = (link: { rel: string; href: string; [key: string]: string }) => {
    const { rel, href, ...rest } = link;
    return <link key={`${rel}-${href}`} rel={rel} href={href} {...rest} />;
  };

  // ===== Render =====

  return (
    <Helmet>
      {/* ===== Base ===== */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* ===== Language & Locale ===== */}
      <html lang="en" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={siteName} />

      {/* ===== Robots ===== */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* ===== Performance ===== */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      {preconnect.map((url) => (
        <link key={url} rel="preconnect" href={url} crossOrigin="anonymous" />
      ))}

      {/* ===== Open Graph ===== */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* ===== Twitter Card ===== */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <meta name="twitter:site" content="@balajicars" />
      <meta name="twitter:creator" content="@balajicars" />

      {/* ===== Additional Meta Tags ===== */}
      {additionalMeta.map(renderMeta)}

      {/* ===== Additional Link Tags ===== */}
      {additionalLinks.map(renderLink)}

      {/* ===== JSON-LD Structured Data ===== */}
      {jsonLdList.map((schema, index) => (
        <script key={`json-ld-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// ============================================
// OPTIONAL: Pre-built JSON-LD generators
// ============================================

/**
 * Generate Organization JSON-LD
 */
export const generateOrganizationSchema = (data: {
  name: string;
  url: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  socialLinks?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: data.name,
  url: data.url,
  logo: data.logo,
  telephone: data.phone,
  email: data.email,
  address: data.address ? {
    '@type': 'PostalAddress',
    streetAddress: data.address,
  } : undefined,
  sameAs: data.socialLinks || [],
});

/**
 * Generate Website JSON-LD
 */
export const generateWebsiteSchema = (data: {
  name: string;
  url: string;
  description?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: data.name,
  url: data.url,
  description: data.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${data.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Generate Breadcrumb JSON-LD
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Generate Product JSON-LD (for car listings)
 */
export const generateProductSchema = (data: {
  name: string;
  description: string;
  image: string;
  price: number;
  priceCurrency?: string;
  brand: string;
  model: string;
  year: number;
  fuelType?: string;
  mileage?: number;
  availability?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: data.name,
  description: data.description,
  image: data.image,
  sku: `${data.brand}-${data.model}-${data.year}`,
  brand: {
    '@type': 'Brand',
    name: data.brand,
  },
  model: data.model,
  productionDate: data.year?.toString(),
  vehicleEngine: data.fuelType ? {
    '@type': 'EngineSpecification',
    fuelType: data.fuelType,
  } : undefined,
  mileage: data.mileage ? {
    '@type': 'QuantitativeValue',
    value: data.mileage,
    unitText: 'KM',
  } : undefined,
  offers: {
    '@type': 'Offer',
    price: data.price,
    priceCurrency: data.priceCurrency || 'INR',
    availability: data.availability || 'https://schema.org/InStock',
    url: data.url,
  },
});