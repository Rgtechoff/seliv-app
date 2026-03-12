'use client';

import * as React from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { SkeletonTable } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';

interface Mission {
  id: string;
  clientId: string;
  vendeurId: string | null;
  status: string;
  date: string;
  startTime: string;
  city: string;
  category: string;
  totalPrice: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-foreground-secondary',
  pending_payment: 'bg-yellow-900/30 text-yellow-400',
  paid: 'bg-blue-900/30 text-blue-400',
  assigned: 'bg-violet-900/30 text-violet-400',
  in_progress: 'bg-orange-900/30 text-orange-400',
  completed: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente paiement',
  paid: 'Payée',
  assigned: 'Assignée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground';
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function SuperAdminMissionsPage() {
  const [missions, setMissions] = React.useState<Mission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/missions');
      const data = res.data.data as Mission[];
      setMissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { void load(); }, []);

  const handleExport = () => {
    const header = 'id,clientId,vendeurId,status,date,city,category,totalPrice\n';
    const rows = missions.map(
      (m) => `${m.id},${m.clientId},${m.vendeurId ?? ''},${m.status},${m.date},${m.city},${m.category},${m.totalPrice}`,
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `missions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const displayed = missions.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.id.includes(q) || m.city.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    const matchStatus = !filterStatus || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = missions.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Missions"
        description={`${missions.length} missions au total`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={missions.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        }
      />

      {/* Status summary chips */}
      {!loading && missions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus((prev) => (prev === status ? '' : status))}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === status
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/30 hover:bg-muted'
              }`}
            >
              <span>{STATUS_LABELS[status] ?? status}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">{count}</Badge>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background text-sm"
            placeholder="Rechercher par ID, ville, catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-input rounded-lg px-3 py-2 bg-background text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={10} />
      ) : displayed.length === 0 ? (
        <EmptyState
          title="Aucune mission"
          description="Aucune mission ne correspond aux filtres sélectionnés."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ville</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vendeur</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Créée le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayed.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{m.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {formatDate(m.date)}
                      <span className="block text-muted-foreground">{m.startTime}</span>
                    </td>
                    <td className="px-4 py-3">{m.city}</td>
                    <td className="px-4 py-3 capitalize">{m.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3">
                      {m.vendeurId ? (
                        <span className="font-mono text-xs text-muted-foreground">{m.vendeurId.slice(0, 8)}…</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(m.totalPrice)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {displayed.length} / {missions.length} missions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
