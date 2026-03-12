'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MissionCard } from '@/components/mission-card';
import { useMyMissions } from '@/lib/hooks/use-missions';
import { useAuth } from '@/lib/hooks/use-auth';
import type { MissionStatus } from '@/lib/types';

const ACTIVE: MissionStatus[] = ['pending_payment', 'paid', 'assigned', 'in_progress'];

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const { missions, isLoading } = useMyMissions();

  const active = missions.filter((m) => ACTIVE.includes(m.status));
  const recent = missions.filter((m) => !ACTIVE.includes(m.status)).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-foreground-secondary text-sm mt-0.5">
            Bienvenue, {user?.companyName ?? user?.firstName}
          </p>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
        >
          <Link href="/missions/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle mission
          </Link>
        </Button>
      </div>

      {/* Active missions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Missions en cours</h2>
          {active.length > 0 && (
            <span className="text-xs font-medium bg-primary-light text-primary border border-primary/30 rounded-full px-2.5 py-0.5">
              {active.length} Actives
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-foreground-secondary text-sm">
              Aucune mission active.{' '}
              <Link href="/missions/new" className="text-primary hover:underline font-medium">
                Créez votre première mission
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((m, i) => (
              <MissionCard key={m.id} mission={m} href={`/missions/${m.id}`} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Recent missions */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Missions récentes</h2>
            <Link
              href="/history"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Voir tout
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((m, i) => (
              <MissionCard key={m.id} mission={m} href={`/missions/${m.id}`} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
