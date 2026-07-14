import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Rendered in place of the img when the src fails to load (e.g. an emoji). */
  fallback?: ReactNode;
}

/**
 * Product/marketing image that degrades gracefully: remote CDN images can
 * disappear, so callers pass the previous placeholder visual as `fallback`.
 */
export function ImageWithFallback({
  src,
  fallback = null,
  className,
  alt = '',
  loading = 'lazy',
  ...rest
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
      {...rest}
    />
  );
}
