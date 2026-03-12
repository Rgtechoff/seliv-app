'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, missionsApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import type { Mission } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { ArrowLeft, User, Calendar, MapPin, Package, AlertTriangle } from 'lucide-react';

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
      <div className="text-center py-12 text-foreground-secondary">
        Mission introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mission — {mission.category}
          </h1>
          <p className="text-xs text-foreground-secondary font-mono mt-0.5">{mission.id}</p>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Informations générales */}
          <div className="bg-card border border-border rounded-xl shadow-card">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Informations générales</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Date du live</p>
                  <p className="text-foreground-secondary text-xs">
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
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Volume / Durée</p>
                  <p className="text-foreground-secondary text-xs">
                    {mission.volume} articles — {mission.durationHours}h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Adresse</p>
                  <p className="text-foreground-secondary text-xs">
                    {mission.address}, {mission.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="bg-card border border-border rounded-xl shadow-card">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <User className="h-4 w-4 text-foreground-secondary" />
              <h2 className="font-semibold text-foreground">Client</h2>
            </div>
            <div className="p-6 text-sm">
              {mission.client ? (
                <>
                  <p className="font-medium text-foreground">
                    {mission.client.firstName} {mission.client.lastName}
                  </p>
                  {mission.client.companyName && (
                    <p className="text-foreground-secondary mt-0.5">{mission.client.companyName}</p>
                  )}
                  <p className="text-foreground-secondary font-mono text-xs mt-1">{mission.clientId}</p>
                </>
              ) : (
                <p className="font-mono text-xs text-foreground-secondary">{mission.clientId}</p>
              )}
            </div>
          </div>

          {/* Vendeur */}
          <div className="bg-card border border-border rounded-xl shadow-card">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-foreground-secondary" />
                <h2 className="font-semibold text-foreground">Vendeur</h2>
              </div>
              {(mission.status === 'paid' || mission.status === 'assigned') && (
                <button
                  onClick={() => setAssignOpen(true)}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg px-3 py-1.5 text-xs transition-colors"
                >
                  {mission.vendeurId ? 'Réassigner' : 'Assigner un vendeur'}
                </button>
              )}
            </div>
            <div className="p-6 text-sm">
              {mission.vendeurId ? (
                <>
                  {mission.vendeur ? (
                    <>
                      <p className="font-medium text-foreground">
                        {mission.vendeur.firstName} {mission.vendeur.lastName}
                      </p>
                      {mission.vendeur.level && (
                        <span className="mt-1 inline-block bg-info/20 text-info border border-info/30 rounded text-xs px-2 py-0.5">
                          {mission.vendeur.level}
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="font-mono text-xs text-foreground-secondary">{mission.vendeurId}</p>
                  )}
                </>
              ) : (
                <p className="text-foreground-secondary">Aucun vendeur assigné</p>
              )}
            </div>
          </div>

          {/* Annulation */}
          {mission.status === 'cancelled' && (
            <div className="bg-card border border-error/30 border-l-4 border-l-error rounded-xl shadow-card">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-error" />
                <h2 className="font-semibold text-error">Annulation</h2>
              </div>
              <div className="p-6 text-sm space-y-1">
                {mission.cancelledAt && (
                  <p className="text-foreground-secondary">
                    <span className="font-medium text-foreground">Date : </span>
                    {new Date(mission.cancelledAt).toLocaleString('fr-FR')}
                  </p>
                )}
                {mission.cancellationReason && (
                  <p className="text-foreground-secondary">
                    <span className="font-medium text-foreground">Raison : </span>
                    {mission.cancellationReason}
                  </p>
                )}
                {(mission as Mission & { refundAmount?: number }).refundAmount !== undefined && (
                  <p className="text-foreground-secondary">
                    <span className="font-medium text-foreground">Remboursement : </span>
                    <span className="text-success font-medium">
                      {formatPrice((mission as Mission & { refundAmount?: number }).refundAmount ?? 0)}
                    </span>
                  </p>
                )}
              </div>
            </div>
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

          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h2 className="font-semibold text-foreground mb-3">Dates</h2>
            <div className="space-y-1.5">
              <p className="text-xs text-foreground-secondary">
                <span className="text-foreground font-medium">Créée : </span>
                {new Date(mission.createdAt).toLocaleString('fr-FR')}
              </p>
              {mission.paidAt && (
                <p className="text-xs text-foreground-secondary">
                  <span className="text-foreground font-medium">Payée : </span>
                  {new Date(mission.paidAt).toLocaleString('fr-FR')}
                </p>
              )}
              {mission.completedAt && (
                <p className="text-xs text-foreground-secondary">
                  <span className="text-foreground font-medium">Terminée : </span>
                  {new Date(mission.completedAt).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      {user && (mission.status === 'assigned' || mission.status === 'in_progress' || mission.status === 'completed') && (
        <ChatWidget missionId={mission.id} currentUser={user} />
      )}

      {/* Assign vendeur dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="bg-card border border-border rounded-xl shadow-modal">
          <DialogHeader>
            <DialogTitle className="text-foreground">Assigner un vendeur</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="vendeurId" className="text-sm text-foreground-secondary">
              UUID du vendeur
            </Label>
            <input
              id="vendeurId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={vendeurId}
              onChange={(e) => setVendeurId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setAssignOpen(false)}
              className="border border-border bg-transparent hover:bg-primary-light text-foreground rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Annuler
            </button>
            <Button
              onClick={handleAssign}
              disabled={assigning || !vendeurId.trim()}
              className="bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg"
            >
              {assigning ? 'Assignation…' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
