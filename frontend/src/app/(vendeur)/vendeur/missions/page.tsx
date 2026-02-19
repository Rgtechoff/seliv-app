'use client';

import { MissionCard } from '@/components/mission-card';
import { useAvailableMissions } from '@/lib/hooks/use-missions';

export default function VendeurMissionsPage() {
  const { missions, isLoading } = useAvailableMissions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Missions disponibles</h1>
      <p className="text-muted-foreground text-sm">
        Missions filtrées selon vos zones et catégories déclarées.
      </p>
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : missions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Aucune mission disponible pour le moment. Revenez bientôt !
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {missions.map((m) => (
            <MissionCard key={m.id} mission={m} href={`/vendeur/missions/${m.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
