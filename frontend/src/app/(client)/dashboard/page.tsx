'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MissionCard } from '@/components/mission-card';
import { useMyMissions } from '@/lib/hooks/use-missions';
import type { MissionStatus } from '@/lib/types';

const ACTIVE: MissionStatus[] = ['pending_payment', 'paid', 'assigned', 'in_progress'];

export default function ClientDashboardPage() {
  const { missions, isLoading } = useMyMissions();

  const active = missions.filter((m) => ACTIVE.includes(m.status));
  const recent = missions.filter((m) => !ACTIVE.includes(m.status)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/missions/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle mission
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Missions en cours ({active.length})</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : active.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune mission active.{' '}
            <Link href="/missions/new" className="text-primary hover:underline">
              Créez votre première mission
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((m) => (
              <MissionCard key={m.id} mission={m} href={`/missions/${m.id}`} />
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Missions récentes</h2>
            <Link href="/history" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((m) => (
              <MissionCard key={m.id} mission={m} href={`/missions/${m.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
