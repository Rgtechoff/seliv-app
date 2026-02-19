'use client';

import { useState } from 'react';
import { MissionCard } from '@/components/mission-card';
import { useMyMissions } from '@/lib/hooks/use-missions';
import { paymentsApi } from '@/lib/api';

export default function ClientHistoryPage() {
  const { missions, isLoading } = useMyMissions();
  const done = missions.filter((m) => ['completed', 'cancelled'].includes(m.status));
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = async (missionId: string): Promise<void> => {
    setDownloadingId(missionId);
    try {
      const res = await paymentsApi.downloadInvoice(missionId);
      const blob = new Blob([res.data as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${missionId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Erreur silencieuse — l'utilisateur peut réessayer
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historique</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : done.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucune mission terminée ou annulée.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {done.map((m) => (
            <div key={m.id} className="flex flex-col gap-2">
              <MissionCard mission={m} href={`/missions/${m.id}`} />
              {m.status === 'completed' && (
                <button
                  onClick={() => void handleDownloadInvoice(m.id)}
                  disabled={downloadingId === m.id}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {downloadingId === m.id ? 'Téléchargement…' : 'Télécharger la facture'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
