import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30',
        secondary:
          'bg-muted/20 text-muted-foreground border-border hover:bg-muted/30',
        destructive:
          'bg-error/20 text-error border-error/30 hover:bg-error/30',
        outline:
          'border-border text-foreground bg-transparent',
        success:
          'bg-success/20 text-success border-success/30 hover:bg-success/30',
        warning:
          'bg-warning/20 text-warning border-warning/30 hover:bg-warning/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
