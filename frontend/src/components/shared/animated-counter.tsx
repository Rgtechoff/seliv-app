'use client';

import * as React from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  format,
  className,
}: AnimatedCounterProps) {
  const [current, setCurrent] = React.useState(0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setCurrent(value);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration, prefersReducedMotion]);

  const display = format ? format(current) : current.toLocaleString('fr-FR');
  return <span className={className}>{display}</span>;
}
