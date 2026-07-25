/**
 * Car images are uploaded to Cloudinary (see backend/src/config/cloudinary.js),
 * which supports on-the-fly resizing/format/quality transforms via URL
 * segments. This inserts the right transform for the context an image is
 * used in — e.g. a 400px-wide card thumbnail doesn't need the full
 * 1600px upload — cutting payload size substantially. Non-Cloudinary URLs
 * (placeholder/unsplash images, or if Cloudinary isn't configured) are
 * returned unchanged.
 */
export function optimizeImage(url: string | undefined, width: number): string {
  if (!url) return url ?? '';
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (!url.includes('res.cloudinary.com') || idx === -1) return url;

  const transform = `f_auto,q_auto,w_${width},c_limit`;
  return url.slice(0, idx + marker.length) + transform + '/' + url.slice(idx + marker.length);
}
