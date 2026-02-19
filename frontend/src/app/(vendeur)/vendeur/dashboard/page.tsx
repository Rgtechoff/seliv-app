'use client';

import Link from 'next/link';
import { MissionCard } from '@/components/mission-card';
import { useMyMissions } from '@/lib/hooks/use-missions';
import { useAuth } from '@/lib/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function VendeurDashboardPage() {
  const { user } = useAuth();
  const { missions, isLoading } = useMyMissions();

  const active = missions.filter((m) => ['assigned', 'in_progress'].includes(m.status));
  const upcoming = missions.filter((m) => m.status === 'assigned');

  if (!user?.isValidated) {
    return (
      <Alert>
        <AlertDescription>
          Votre profil est en cours de validation par l&apos;équipe SELIV. Vous recevrez un email
          dès que votre compte sera activé.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Bonjour, {user.firstName} {user.isStar && '⭐'}
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold">{active.length}</p>
          <p className="text-sm text-muted-foreground">Missions actives</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold">{upcoming.length}</p>
          <p className="text-sm text-muted-foreground">Prochains lives</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold">{missions.filter((m) => m.status === 'completed').length}</p>
          <p className="text-sm text-muted-foreground">Missions terminées</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Missions en cours</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/vendeur/missions">Voir les disponibles</Link>
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : active.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune mission active.{' '}
            <Link href="/vendeur/missions" className="text-primary hover:underline">
              Parcourir les missions disponibles
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((m) => (
              <MissionCard key={m.id} mission={m} href={`/vendeur/missions/${m.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
