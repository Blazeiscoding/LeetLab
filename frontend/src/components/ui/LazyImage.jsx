import { useState, useRef, useEffect } from 'react';

/**
 * LazyImage - Image component with lazy loading and blur-up effect
 * 
 * Features:
 * - IntersectionObserver for viewport detection
 * - Blur-up placeholder animation
 * - Error fallback handling
 * - Native loading="lazy" as fallback
 */

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  fallbackSrc = '/placeholder-image.png',
  aspectRatio,
  objectFit = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio,
      }}
    >
      {/* Placeholder / Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-base-300 animate-pulse" />
      )}

      {/* Blur-up placeholder */}
      {placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full blur-sm scale-105"
          style={{ objectFit }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          className={`
            w-full h-full transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

/**
 * Avatar - Specialized LazyImage for user avatars
 */
export const Avatar = ({
  src,
  alt,
  size = 'md',
  className = '',
  fallback,
  ...props
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const [hasError, setHasError] = useState(false);

  // Generate fallback avatar from name
  const getFallbackUrl = () => {
    if (fallback) return fallback;
    const initials = alt?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden ${className}`}>
      <img
        src={hasError ? getFallbackUrl() : src || getFallbackUrl()}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default LazyImage;
