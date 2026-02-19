import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatPrice, type Mission } from '@/lib/types';

interface MissionCardProps {
  mission: Mission;
  href: string;
  actions?: React.ReactNode;
}

export function MissionCard({ mission, href, actions }: MissionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold capitalize">{mission.category}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(mission.date), 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <StatusBadge status={mission.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{mission.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{mission.startTime} · {mission.durationHours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 shrink-0" />
            <span>{mission.volume} articles</span>
          </div>
          <div className="font-medium text-foreground">
            {formatPrice(mission.totalPrice)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={href}>Voir les détails</Link>
        </Button>
        {actions}
      </CardFooter>
    </Card>
  );
}
