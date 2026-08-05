// src/utils/optimizeImage.ts

const PLACEHOLDER = '/images/placeholder-car.jpg';

export function optimizeImage(
  url?: string | null,
  width?: number
): string {
  if (!url || url.trim() === '') return PLACEHOLDER;

  try {
    // 1. Cloudinary
    if (url.includes('res.cloudinary.com')) {
      const marker = '/upload/';
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const transform = `f_auto,q_auto${width ? `,w_${width},c_limit` : ''}`;
        return url.slice(0, idx + marker.length) + transform + '/' + url.slice(idx + marker.length);
      }
    }

    // 2. Unsplash
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}auto=format&fit=crop${width ? `&w=${width}` : ''}`;
    }

    // 3. External CDN (general)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (width) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${width}&auto=format&fit=crop`;
      }
      return url;
    }

    // 4. Local / relative paths (no modifications)
    // Just ensure a single leading slash
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return normalized;
  } catch (error) {
    console.warn('Image optimization error:', error);
    return PLACEHOLDER;
  }
}

export function getSafeImageUrl(
  url?: string | null,
  width?: number,
  fallback: string = PLACEHOLDER
): string {
  const optimized = optimizeImage(url, width);
  return optimized || fallback;
}