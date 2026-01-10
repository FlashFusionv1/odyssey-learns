/**
 * Image optimization utilities for lazy loading and performance
 */

import { useEffect, useRef, useState, useCallback, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  /** Placeholder to show while loading */
  placeholder?: 'blur' | 'skeleton' | 'none';
  /** Low quality image to use as blur placeholder */
  blurDataUrl?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Priority loading (skip lazy load) */
  priority?: boolean;
}

/**
 * Optimized image component with lazy loading and placeholders
 */
export function OptimizedImage({
  src,
  alt,
  className,
  placeholder = 'skeleton',
  blurDataUrl,
  onLoad,
  onError,
  priority = false,
  ...props
}: OptimizedImageProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    
    observer.observe(imgRef.current);
    
    return () => observer.disconnect();
  }, [priority]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);
  
  // Error fallback
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        role="img"
        aria-label={alt || 'Image failed to load'}
        {...props}
      >
        <svg
          className="w-8 h-8 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }
  
  return (
    <div className={cn("relative overflow-hidden", className)} ref={imgRef}>
      {/* Placeholder */}
      {!isLoaded && placeholder !== 'none' && (
        <>
          {placeholder === 'blur' && blurDataUrl && (
            <img
              src={blurDataUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
              aria-hidden="true"
            />
          )}
          {placeholder === 'skeleton' && (
            <div 
              className="absolute inset-0 bg-muted animate-pulse"
              aria-hidden="true"
            />
          )}
        </>
      )}
      
      {/* Actual image */}
      {isInView && src && (
        <img
          src={src}
          alt={alt || ''}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

/**
 * Hook for preloading images
 */
export function useImagePreload(urls: string[]): {
  loaded: Set<string>;
  loading: boolean;
  errors: Set<string>;
} {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(urls.length > 0);
  
  useEffect(() => {
    if (urls.length === 0) {
      setLoading(false);
      return;
    }
    
    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          setLoaded(prev => new Set([...prev, url]));
          resolve();
        };
        img.onerror = () => {
          setErrors(prev => new Set([...prev, url]));
          resolve();
        };
        img.src = url;
      });
    };
    
    Promise.all(urls.map(loadImage)).then(() => {
      setLoading(false);
    });
  }, [urls]);
  
  return { loaded, loading, errors };
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get optimized image URL with width/quality params
 * Works with image CDNs that support query params
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; quality?: number } = {}
): string {
  const { width = 800, quality = 80 } = options;
  
  // If it's a Supabase storage URL, use transform params
  if (url.includes('supabase.co/storage')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}`;
  }
  
  // Otherwise return original URL
  return url;
}
