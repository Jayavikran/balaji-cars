import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  /** One or more JSON-LD objects to inject as <script type="application/ld+json"> tags. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Centralizes everything a page needs for SEO: title, meta description,
 * canonical URL (derived from the current path, query params stripped so
 * filtered/sorted views of the same listing aren't treated as duplicate
 * pages), Open Graph, Twitter Card, and optional JSON-LD structured data.
 */
export default function Seo({ title, description, image, type = 'website', noindex = false, jsonLd }: SeoProps) {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {jsonLdList.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
