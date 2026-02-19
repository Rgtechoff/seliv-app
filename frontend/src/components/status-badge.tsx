import { Badge } from '@/components/ui/badge';
import { MISSION_STATUS_LABELS, type MissionStatus } from '@/lib/types';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';

const STATUS_VARIANT: Record<MissionStatus, VariantProps<typeof badgeVariants>['variant']> = {
  draft: 'secondary',
  pending_payment: 'warning',
  paid: 'default',
  assigned: 'default',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {MISSION_STATUS_LABELS[status]}
    </Badge>
  );
}
