import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router keeps the browser's scroll position between navigations
 * (it's an SPA — the page never actually reloads). Without this, clicking
 * a "Similar Car" or any other in-app link leaves the viewport wherever it
 * was on the previous page instead of starting at the top of the new one.
 *
 * Mounted once near the root (see App.tsx). Watches the pathname so it
 * fires on every route change, including navigating between two car
 * detail pages (e.g. /cars/fortuner-legender -> /cars/mahindra-thar-lx-4wd),
 * where the component itself doesn't unmount — only the URL param changes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
