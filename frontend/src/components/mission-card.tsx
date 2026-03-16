'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatPrice, type Mission, type MissionStatus } from '@/lib/types';

interface MissionCardProps {
  mission: Mission;
  href: string;
  actions?: React.ReactNode;
  index?: number;
  /** Optional slot to override the address/city display row */
  addressSlot?: React.ReactNode;
}

const STATUS_BORDER: Record<MissionStatus, string> = {
  draft: 'border-l-slate-300',
  pending_payment: 'border-l-amber-400',
  paid: 'border-l-blue-400',
  assigned: 'border-l-indigo-400',
  in_progress: 'border-l-violet-500',
  completed: 'border-l-green-500',
  cancelled: 'border-l-red-400',
};

export function MissionCard({ mission, href, actions, index = 0, addressSlot }: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <div
        className={cn(
          'bg-card border border-border rounded-xl overflow-hidden',
          'border-l-4',
          STATUS_BORDER[mission.status],
          'hover:shadow-hover transition-shadow',
        )}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold capitalize text-foreground">{mission.category}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(mission.date), 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <StatusBadge status={mission.status} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {addressSlot ? (
                addressSlot
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{mission.address_display ?? mission.city}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{mission.startTime} · {mission.durationHours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5 shrink-0" />
              <span>{mission.volume} articles</span>
            </div>
            <div className="font-semibold text-foreground">
              {formatPrice(mission.totalPrice)}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={href}>Voir les détails</Link>
          </Button>
          {actions}
        </div>
      </div>
    </motion.div>
  );
}
