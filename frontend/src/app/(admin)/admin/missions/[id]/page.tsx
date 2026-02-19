'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, missionsApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import { PriceBreakdown } from '@/components/price-breakdown';
import { ChatWidget } from '@/components/chat-widget';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Mission } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { ArrowLeft, User, Calendar, MapPin, Package } from 'lucide-react';

export default function AdminMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [vendeurId, setVendeurId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    missionsApi
      .getById(id)
      .then((r) => setMission(r.data))
      .catch(() =>
        toast({ title: 'Erreur', description: 'Mission introuvable', variant: 'destructive' }),
      )
      .finally(() => setLoading(false));
  }, [id, toast]);

  async function handleAssign() {
    if (!vendeurId.trim()) return;
    setAssigning(true);
    try {
      const res = await adminApi.assignVendeur(id, vendeurId.trim());
      setMission(res.data);
      setAssignOpen(false);
      setVendeurId('');
      toast({ title: 'Vendeur assigné avec succès' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'assigner le vendeur', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Mission introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Mission — {mission.category}
          </h1>
          <p className="text-sm text-muted-foreground">ID : {mission.id}</p>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Date du live</p>
                  <p className="text-muted-foreground">
                    {new Date(mission.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' à '}{mission.startTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Volume / Durée</p>
                  <p className="text-muted-foreground">
                    {mission.volume} articles — {mission.durationHours}h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-muted-foreground">
                    {mission.address}, {mission.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" /> Client
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {mission.client ? (
                <>
                  <p className="font-medium">
                    {mission.client.firstName} {mission.client.lastName}
                  </p>
                  {mission.client.companyName && (
                    <p className="text-muted-foreground">{mission.client.companyName}</p>
                  )}
                  <p className="text-muted-foreground font-mono text-xs">{mission.clientId}</p>
                </>
              ) : (
                <p className="font-mono text-xs text-muted-foreground">{mission.clientId}</p>
              )}
            </CardContent>
          </Card>

          {/* Vendeur info + assign */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Vendeur
                </CardTitle>
                {(mission.status === 'paid' || mission.status === 'assigned') && (
                  <Button size="sm" onClick={() => setAssignOpen(true)}>
                    {mission.vendeurId ? 'Réassigner' : 'Assigner un vendeur'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              {mission.vendeurId ? (
                <>
                  {mission.vendeur ? (
                    <>
                      <p className="font-medium">
                        {mission.vendeur.firstName} {mission.vendeur.lastName}
                      </p>
                      {mission.vendeur.level && (
                        <Badge variant="outline" className="mt-1">
                          {mission.vendeur.level}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground">{mission.vendeurId}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Aucun vendeur assigné</p>
              )}
            </CardContent>
          </Card>

          {/* Cancellation info */}
          {mission.status === 'cancelled' && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Annulation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {mission.cancelledAt && (
                  <p>
                    <span className="font-medium">Date : </span>
                    {new Date(mission.cancelledAt).toLocaleString('fr-FR')}
                  </p>
                )}
                {mission.cancellationReason && (
                  <p>
                    <span className="font-medium">Raison : </span>
                    {mission.cancellationReason}
                  </p>
                )}
                {(mission as Mission & { refundAmount?: number }).refundAmount !== undefined && (
                  <p>
                    <span className="font-medium">Remboursement : </span>
                    {formatPrice((mission as Mission & { refundAmount?: number }).refundAmount ?? 0)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: pricing + metadata */}
        <div className="space-y-4">
          <PriceBreakdown
            basePrice={mission.basePrice}
            optionsPrice={mission.optionsPrice}
            discount={mission.discount}
            totalPrice={mission.totalPrice}
          />

          <Card>
            <CardHeader>
              <CardTitle>Dates</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>Créée : {new Date(mission.createdAt).toLocaleString('fr-FR')}</p>
              {mission.paidAt && (
                <p>Payée : {new Date(mission.paidAt).toLocaleString('fr-FR')}</p>
              )}
              {mission.completedAt && (
                <p>Terminée : {new Date(mission.completedAt).toLocaleString('fr-FR')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat (admin can view) */}
      {user && (mission.status === 'assigned' || mission.status === 'in_progress' || mission.status === 'completed') && (
        <ChatWidget missionId={mission.id} currentUser={user} />
      )}

      {/* Assign vendeur dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un vendeur</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="vendeurId">UUID du vendeur</Label>
            <Input
              id="vendeurId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={vendeurId}
              onChange={(e) => setVendeurId(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssign} disabled={assigning || !vendeurId.trim()}>
              {assigning ? 'Assignation…' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
