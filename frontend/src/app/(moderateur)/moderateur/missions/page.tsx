'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
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
import { AlertTriangle } from 'lucide-react';

export default function ModerateurMissionsPage() {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  // Missions with active chats are: assigned or in_progress
  const activeMissions = missions.filter(
    (m) => m.status === 'assigned' || m.status === 'in_progress',
  );

  useEffect(() => {
    adminApi
      .getMissions()
      .then((r) => setMissions(r.data ?? []))
      .catch(() =>
        toast({ title: 'Erreur', description: 'Impossible de charger les missions', variant: 'destructive' }),
      )
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Missions à modérer</h1>
        <p className="text-muted-foreground mt-1">
          Missions avec chat actif — inspectez les messages signalés.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Missions actives ({activeMissions.length})
            </CardTitle>
            {activeMissions.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                À surveiller
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeMissions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucune mission active pour le moment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium capitalize">
                      {mission.category}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(mission.date).toLocaleDateString('fr-FR')}
                      {' à '}{mission.startTime}
                    </TableCell>
                    <TableCell className="text-sm">{mission.city}</TableCell>
                    <TableCell>
                      <StatusBadge status={mission.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/moderateur/missions/${mission.id}`}
                        className="text-primary text-sm hover:underline font-medium"
                      >
                        Inspecter →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Also show all other missions for context */}
      {missions.filter((m) => m.status !== 'assigned' && m.status !== 'in_progress').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-base">
              Autres missions ({missions.filter((m) => m.status !== 'assigned' && m.status !== 'in_progress').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions
                  .filter((m) => m.status !== 'assigned' && m.status !== 'in_progress')
                  .map((mission) => (
                    <TableRow key={mission.id} className="opacity-60">
                      <TableCell className="font-medium capitalize">
                        {mission.category}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(mission.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-sm">{mission.city}</TableCell>
                      <TableCell>
                        <StatusBadge status={mission.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/moderateur/missions/${mission.id}`}
                          className="text-muted-foreground text-sm hover:underline"
                        >
                          Voir →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
