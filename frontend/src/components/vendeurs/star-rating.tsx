'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const pixelSize = size === 'sm' ? 14 : 18;

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const filled = rating >= starValue;
        const partial = !filled && rating > i;
        const fillPercent = partial ? Math.round((rating - i) * 100) : 0;

        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: pixelSize, height: pixelSize }}
          >
            {/* Empty star (background) */}
            <Star
              width={pixelSize}
              height={pixelSize}
              className="fill-none text-gray-300 absolute inset-0"
            />
            {/* Filled star (foreground, clipped) */}
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${fillPercent}%` }}
              >
                <Star
                  width={pixelSize}
                  height={pixelSize}
                  className={cn(
                    'fill-yellow-400 text-yellow-400 absolute inset-0',
                  )}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
