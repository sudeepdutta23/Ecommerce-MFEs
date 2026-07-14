import { useEffect, useRef, useState } from 'react';
import { cn } from './cn';

export interface AnimatedNumberProps {
  value: number;
  /** Formatter applied to each animation frame (e.g. currency/compact). */
  format?: (value: number) => string;
  /** Animation duration in milliseconds. */
  duration?: number;
  className?: string;
}

/**
 * Number that counts up/down to `value` whenever it changes, with a subtle
 * pop on arrival. Respects prefers-reduced-motion by snapping instantly.
 */
export function AnimatedNumber({
  value,
  format = (v) => String(Math.round(v)),
  duration = 700,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const [popping, setPopping] = useState(false);
  const previousRef = useRef(value);
  const frameRef = useRef<number>();

  useEffect(() => {
    const from = previousRef.current;
    previousRef.current = value;
    if (from === value) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setPopping(true);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span
      className={cn('inline-block tabular-nums', popping && 'animate-pop', className)}
      onAnimationEnd={() => setPopping(false)}
    >
      {format(display)}
    </span>
  );
}
