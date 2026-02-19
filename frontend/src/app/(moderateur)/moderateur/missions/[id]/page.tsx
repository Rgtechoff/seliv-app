'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { missionsApi, adminApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Mission } from '@/lib/types';
import { ArrowLeft, AlertTriangle, CheckCircle, Trash2, MessageSquare } from 'lucide-react';

interface FlaggedMessage {
  id: string;
  missionId: string;
  senderId: string;
  content: string;
  isFlagged: boolean;
  createdAt: string;
  sender?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function ModerateurMissionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [mission, setMission] = useState<Mission | null>(null);
  const [flagged, setFlagged] = useState<FlaggedMessage[]>([]);
  const [loadingMission, setLoadingMission] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    missionsApi
      .getById(id)
      .then((r) => setMission(r.data))
      .catch(() =>
        toast({ title: 'Mission introuvable', variant: 'destructive' }),
      )
      .finally(() => setLoadingMission(false));

    adminApi
      .getFlaggedMessages()
      .then((r) => {
        const all: FlaggedMessage[] = r.data ?? [];
        setFlagged(all.filter((m) => m.missionId === id));
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [id, toast]);

  async function handleApprove(msgId: string) {
    setActioning(msgId);
    try {
      await adminApi.approveMessage(msgId);
      setFlagged((prev) => prev.filter((m) => m.id !== msgId));
      toast({ title: 'Message approuvé et diffusé' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setActioning(null);
    }
  }

  async function handleDelete(msgId: string) {
    setActioning(msgId);
    try {
      await adminApi.deleteMessage(msgId);
      setFlagged((prev) => prev.filter((m) => m.id !== msgId));
      toast({ title: 'Message supprimé' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setActioning(null);
    }
  }

  if (loadingMission) {
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

      {/* Mission summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la mission</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">
              {new Date(mission.date).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Heure</p>
            <p className="font-medium">{mission.startTime} — {mission.durationHours}h</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ville</p>
            <p className="font-medium">{mission.city}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Volume</p>
            <p className="font-medium">{mission.volume} articles</p>
          </div>
          <div>
            <p className="text-muted-foreground">Client</p>
            <p className="font-mono text-xs">{mission.clientId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vendeur</p>
            <p className="font-mono text-xs">{mission.vendeurId ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Flagged messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages signalés
              {flagged.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {flagged.length}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMsgs ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : flagged.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Aucun message signalé pour cette mission.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Envoyeur</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagged.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="text-sm">
                      {msg.sender
                        ? `${msg.sender.firstName ?? ''} ${msg.sender.lastName ?? ''}`.trim()
                        : msg.senderId.slice(0, 8) + '…'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 text-destructive mt-1 shrink-0" />
                        <span className="text-sm break-words">{msg.content}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200"
                          disabled={actioning === msg.id}
                          onClick={() => handleApprove(msg.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/20"
                          disabled={actioning === msg.id}
                          onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
