'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/status-badge';
import { PriceBreakdown } from '@/components/price-breakdown';
import { ChatWidget } from '@/components/chat-widget';
import { useMission } from '@/lib/hooks/use-missions';
import { useAuth } from '@/lib/hooks/use-auth';
import { paymentsApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ClientMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { mission, isLoading, error, reload } = useMission(id);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      await paymentsApi.cancelMission(id, cancelReason);
      await reload();
      setCancelOpen(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Erreur lors de l\'annulation');
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Chargement…</p>;
  if (error || !mission)
    return <Alert variant="destructive"><AlertDescription>{error ?? 'Mission introuvable'}</AlertDescription></Alert>;

  const canCancel = !['completed', 'cancelled', 'in_progress'].includes(mission.status);

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
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{mission.address_display ?? `${mission.address}, ${mission.city}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{mission.volume} articles</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prix</CardTitle></CardHeader>
        <CardContent>
          <PriceBreakdown
            basePrice={mission.basePrice}
            optionsPrice={mission.optionsPrice}
            discount={mission.discount}
            totalPrice={mission.totalPrice}
          />
        </CardContent>
      </Card>

      {mission.vendeur && (
        <Card>
          <CardHeader><CardTitle>Vendeur assigné</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">
              {mission.vendeur.firstName} {mission.vendeur.lastName}
            </p>
          </CardContent>
        </Card>
      )}

      {canCancel && (
        <Button variant="destructive" onClick={() => setCancelOpen(true)}>
          Annuler la mission
        </Button>
      )}

      {user && ['assigned', 'in_progress', 'paid'].includes(mission.status) && (
        <ChatWidget missionId={id} currentUser={user} />
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la mission</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Annulation ≥ 48h avant le live : remboursement 100%. Annulation &lt; 48h : remboursement 50%.
          </p>
          <div className="space-y-1">
            <Label>Motif d&apos;annulation</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Décrivez la raison…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Retour
            </Button>
            <Button variant="destructive" disabled={cancelLoading || !cancelReason.trim()} onClick={handleCancel}>
              {cancelLoading ? 'Annulation…' : 'Confirmer l\'annulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
