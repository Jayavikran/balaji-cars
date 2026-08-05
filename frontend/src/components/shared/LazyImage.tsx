// src/components/shared/LazyImage.tsx
import { useState, useEffect, useRef, memo, ImgHTMLAttributes } from 'react';
import { optimizeImage } from '@/utils/optimizeImage';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  rootMargin?: string;
  preload?: boolean;
  placeholder?: string;
}

const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = '/images/placeholder-car.jpg',
  rootMargin = '200px',
  preload = false,
  placeholder,
  ...props 
}: LazyImageProps) => {
  const [shouldLoad, setShouldLoad] = useState(preload);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (preload) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, preload]);

  // ✅ FIXED: Handle empty/undefined src
  const finalSrc = !src || src.trim() === '' ? fallback : src;
  const imageSrc = error ? fallback : (shouldLoad ? finalSrc : undefined);
  
  // ✅ FIXED: Only call optimizeImage if we have a valid src
  const blurPlaceholder = placeholder || (finalSrc ? optimizeImage(finalSrc, 20) : fallback);

  // ✅ FIXED: If there's no src or error, show fallback immediately
  if (!src || src.trim() === '' || error) {
    return (
      <img
        src={fallback}
        alt={alt || 'Car image'}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Placeholder blur */}
      {!isLoaded && !preload && shouldLoad && (
        <img
          src={blurPlaceholder}
          alt=""
          className={`${className} blur-md scale-105 opacity-100 transition-opacity duration-300`}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0 }}
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt || 'Car image'}
        className={`${className} transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={preload ? 'eager' : 'lazy'}
        decoding={preload ? 'sync' : 'async'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true);
          setIsLoaded(true);
        }}
        style={{ position: 'relative', zIndex: 1 }}
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;