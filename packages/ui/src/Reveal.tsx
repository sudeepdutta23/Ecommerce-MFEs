import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from './cn';

export interface RevealProps {
  children: ReactNode;
  /** Stagger delay in milliseconds. */
  delay?: number;
  /** Entrance direction. */
  direction?: 'up' | 'down' | 'left' | 'none';
  className?: string;
}

const hiddenByDirection: Record<NonNullable<RevealProps['direction']>, string> = {
  up: 'translate-y-6',
  down: '-translate-y-6',
  left: 'translate-x-8',
  none: '',
};

/**
 * Reveal-on-scroll wrapper: children fade/slide in the first time they enter
 * the viewport. Falls back to always-visible when IntersectionObserver is
 * unavailable or the user prefers reduced motion.
 */
export function Reveal({ children, delay = 0, direction = 'up', className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out-expo',
        visible ? 'translate-x-0 translate-y-0 opacity-100' : cn('opacity-0', hiddenByDirection[direction]),
        className,
      )}
    >
      {children}
    </div>
  );
}
