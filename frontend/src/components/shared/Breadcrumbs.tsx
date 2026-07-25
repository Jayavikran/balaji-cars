import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string; // omit for the current/last page
}

/**
 * Visible breadcrumb trail. Returns its JSON-LD BreadcrumbList schema via
 * `getBreadcrumbJsonLd` so pages can pass it straight into <Seo jsonLd={...}>.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-body mb-4">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-body/50" />}
            {item.href ? (
              <Link to={item.href} className="hover:text-navy dark:hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink dark:text-white/90 font-medium" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function getBreadcrumbJsonLd(items: Crumb[], siteOrigin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? `${siteOrigin}${item.href}` : undefined,
    })),
  };
}
