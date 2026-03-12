'use client';

import { useState } from 'react';
import { MissionCard } from '@/components/mission-card';
import { useMyMissions } from '@/lib/hooks/use-missions';
import { paymentsApi } from '@/lib/api';
import { Download, History } from 'lucide-react';

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique</h1>
          <p className="text-sm text-foreground-secondary">Vos missions terminées et annulées</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : done.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <History className="h-10 w-10 text-foreground-secondary/30 mx-auto mb-3" />
          <p className="text-foreground-secondary text-sm">
            Aucune mission terminée ou annulée.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {done.map((m, i) => (
            <div key={m.id} className="flex flex-col gap-2">
              <MissionCard mission={m} href={`/missions/${m.id}`} index={i} />
              {m.status === 'completed' && (
                <button
                  onClick={() => void handleDownloadInvoice(m.id)}
                  disabled={downloadingId === m.id}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
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
