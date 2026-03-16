'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, Package, Calendar, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/status-badge';
import { PriceBreakdown } from '@/components/price-breakdown';
import { ChatWidget } from '@/components/chat-widget';
import { useMission } from '@/lib/hooks/use-missions';
import { useAuth } from '@/lib/hooks/use-auth';
import { missionsApi } from '@/lib/api';

export default function VendeurMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { mission, isLoading, error, reload } = useMission(id);

  const handleAccept = async () => {
    try {
      await missionsApi.accept(id);
      await reload();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Erreur lors de l\'acceptation');
    }
  };

  const handleComplete = async () => {
    if (!confirm('Marquer cette mission comme terminée ?')) return;
    try {
      await missionsApi.complete(id);
      await reload();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Erreur lors de la complétion');
    }
  };

  const handleCopyAddress = () => {
    if (mission?.address_display) {
      navigator.clipboard.writeText(mission.address_display);
    }
  };

  const handleOpenMaps = () => {
    if (mission?.address_display) {
      const query = encodeURIComponent(mission.address_display);
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Chargement…</p>;
  if (error || !mission)
    return <Alert variant="destructive"><AlertDescription>{error ?? 'Mission introuvable'}</AlertDescription></Alert>;

  const isMyMission = mission.vendeurId === user?.id;
  const addressMasked = mission.address_masked !== false; // default to masked if undefined

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">{mission.category}</h1>
          <p className="text-muted-foreground text-sm">Mission #{id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <Card>
        <CardHeader><CardTitle>Détails</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(mission.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{mission.startTime} · {mission.durationHours}h</span>
          </div>

          {/* Address row — masked or revealed */}
          <div className="col-span-2">
            {addressMasked ? (
              <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-800/40 rounded-xl text-xs text-amber-400">
                <span>🔒</span>
                <div>
                  <p className="font-medium mb-0.5">Adresse masquée</p>
                  <p>Acceptez la mission pour voir l&apos;adresse exacte.</p>
                  {mission.address_display && (
                    <p className="mt-1 text-amber-300/80">
                      📍 {mission.address_display}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{mission.address_display ?? mission.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-border"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-border"
                    onClick={handleOpenMaps}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Google Maps
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{mission.volume} articles</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rémunération</CardTitle></CardHeader>
        <CardContent>
          <PriceBreakdown
            basePrice={mission.basePrice}
            optionsPrice={mission.optionsPrice}
            discount={mission.discount}
            totalPrice={mission.totalPrice}
          />
        </CardContent>
      </Card>

      {mission.status === 'paid' && !isMyMission && (
        <Button className="w-full" onClick={handleAccept}>
          Accepter cette mission
        </Button>
      )}

      {mission.status === 'in_progress' && isMyMission && (
        <Button className="w-full" onClick={handleComplete}>
          Marquer comme terminée
        </Button>
      )}

      {user && isMyMission && ['assigned', 'in_progress'].includes(mission.status) && (
        <ChatWidget missionId={id} currentUser={user} />
      )}
    </div>
  );
}
