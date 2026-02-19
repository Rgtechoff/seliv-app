import { formatPrice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriceBreakdownProps {
  basePrice: number;
  optionsPrice: number;
  discount: number;
  totalPrice: number;
  className?: string;
}

export function PriceBreakdown({
  basePrice,
  optionsPrice,
  discount,
  totalPrice,
  className,
}: PriceBreakdownProps) {
  return (
    <div className={cn('space-y-1 text-sm', className)}>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Prix de base</span>
        <span>{formatPrice(basePrice)}</span>
      </div>
      {optionsPrice > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Options</span>
          <span>+{formatPrice(optionsPrice)}</span>
        </div>
      )}
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Remise abonnement</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t pt-1 font-semibold">
        <span>Total</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
