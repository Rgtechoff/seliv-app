'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function SegmentBadge({ segment }: { segment?: string | null }) {
  const map: Record<string, string> = {
    bronze: 'bg-warning/20 text-warning border border-warning/30',
    silver: 'bg-info/20 text-info border border-info/30',
    gold: 'bg-accent/20 text-accent border border-accent/30',
    vip: 'bg-gradient-to-r from-primary to-accent text-white border-0',
  };
  if (!segment) return null;
  const cls = map[segment.toLowerCase()] ?? 'bg-muted text-foreground-secondary border border-border';
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>
      {segment.charAt(0).toUpperCase() + segment.slice(1)}
    </span>
  );
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getClients().then((res) => {
      setClients((res.data.data as User[]) ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Clients ({clients.length})</h1>
        <p className="text-foreground-secondary text-sm mt-1">Liste des clients inscrits sur la plateforme</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sidebar">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Entreprise</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">SIRET</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Segment</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Inscrit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-foreground-secondary">Chargement…</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-foreground-secondary">Aucun client.</td>
                </tr>
              ) : clients.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-8 h-8 bg-info/20 text-info text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {c.firstName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <p className="font-medium text-foreground">
                        {c.firstName} {c.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">{c.companyName ?? '—'}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-foreground-secondary">{c.siret ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <SegmentBadge segment={(c as User & { segment?: string }).segment} />
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {format(new Date(c.createdAt), 'dd/MM/yy', { locale: fr })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
