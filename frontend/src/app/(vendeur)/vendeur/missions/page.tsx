'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
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
          {missions.map((m, index) => (
            <MissionCard
              key={m.id}
              mission={m}
              href={`/vendeur/missions/${m.id}`}
              index={index}
              actions={
                <Link
                  href={`/vendeur/messages/${m.id}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contacter
                </Link>
              }
              addressSlot={
                m.address_masked !== undefined ? (
                  m.address_masked ? (
                    <span className="text-xs text-foreground-secondary flex items-center gap-1">
                      📍 {m.address_display ?? m.city}
                      <span
                        className="ml-1 text-foreground-secondary/60"
                        title="L'adresse exacte sera révélée après acceptation"
                      >
                        🔒
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-foreground">
                      📍 {m.address_display ?? m.city}
                    </span>
                  )
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
