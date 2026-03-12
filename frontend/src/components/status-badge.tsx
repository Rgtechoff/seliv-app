'use client';

import { cn } from '@/lib/utils';
import {
  FileEdit,
  Clock,
  CreditCard,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { MISSION_STATUS_LABELS, type MissionStatus } from '@/lib/types';

interface StatusConfig {
  icon: React.ElementType;
  className: string;
  dotClass: string;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<MissionStatus, StatusConfig> = {
  draft: {
    icon: FileEdit,
    className: 'bg-muted text-foreground-secondary',
    dotClass: 'bg-foreground-secondary',
  },
  pending_payment: {
    icon: Clock,
    className: 'bg-amber-900/30 text-amber-400',
    dotClass: 'bg-amber-400',
  },
  paid: {
    icon: CreditCard,
    className: 'bg-blue-900/30 text-blue-400',
    dotClass: 'bg-blue-400',
  },
  assigned: {
    icon: UserCheck,
    className: 'bg-indigo-900/30 text-indigo-400',
    dotClass: 'bg-indigo-400',
  },
  in_progress: {
    icon: PlayCircle,
    className: 'bg-violet-900/30 text-violet-400',
    dotClass: 'bg-violet-500',
    pulse: true,
  },
  completed: {
    icon: CheckCircle2,
    className: 'bg-green-900/30 text-green-400',
    dotClass: 'bg-green-500',
  },
  cancelled: {
    icon: XCircle,
    className: 'bg-red-900/30 text-red-400',
    dotClass: 'bg-red-400',
  },
};

interface StatusBadgeProps {
  status: MissionStatus;
  variant?: 'default' | 'dot';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = MISSION_STATUS_LABELS[status];

  if (variant === 'dot') {
    return (
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            config.dotClass,
            config.pulse && 'animate-pulse',
          )}
        />
        <span className="text-sm text-muted-foreground">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
      )}
    >
      <Icon className={cn('w-3 h-3 flex-shrink-0', config.pulse && 'animate-pulse')} />
      {label}
    </span>
  );
}
