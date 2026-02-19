'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function StarRating({
  value,
  max = 5,
  size = 20,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          width={size}
          height={size}
          className={cn(
            'transition-colors',
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300',
            interactive && 'cursor-pointer hover:fill-yellow-300 hover:text-yellow-300',
          )}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );
}
