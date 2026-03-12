'use client';

import * as React from 'react';
import { Search, Download, RefreshCw, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { SkeletonTable } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';

interface ActivityLogEntry {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface LogResponse {
  data: ActivityLogEntry[];
  nextCursor: string | null;
  total: number;
}

const ACTION_COLORS: Record<string, string> = {
  plan_created: 'bg-success/20 text-success border border-success/30',
  plan_updated: 'bg-info/20 text-info border border-info/30',
  plan_deleted: 'bg-error/20 text-error border border-error/30',
  service_created: 'bg-success/20 text-success border border-success/30',
  service_updated: 'bg-info/20 text-info border border-info/30',
  service_deleted: 'bg-error/20 text-error border border-error/30',
  user_suspended: 'bg-warning/20 text-warning border border-warning/30',
  user_unsuspended: 'bg-success/20 text-success border border-success/30',
  user_updated: 'bg-info/20 text-info border border-info/30',
  mission_created: 'bg-primary/10 text-primary border border-primary/30',
  mission_updated: 'bg-info/20 text-info border border-info/30',
};

const ACTION_LABELS: Record<string, string> = {
  plan_created: 'Plan créé',
  plan_updated: 'Plan modifié',
  plan_deleted: 'Plan supprimé',
  service_created: 'Service créé',
  service_updated: 'Service modifié',
  service_deleted: 'Service supprimé',
  user_suspended: 'Utilisateur suspendu',
  user_unsuspended: 'Suspension levée',
  user_updated: 'Utilisateur modifié',
  mission_created: 'Mission créée',
  mission_updated: 'Mission modifiée',
};

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] ?? 'bg-muted/30 text-foreground-secondary border border-border';
  const label = ACTION_LABELS[action] ?? action.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    super_admin: 'bg-red-500/20 text-red-400 border border-red-500/30',
    admin: 'bg-primary/10 text-primary border border-primary/30',
    moderateur: 'bg-warning/20 text-warning border border-warning/30',
  };
  const cls = map[role] ?? 'bg-muted/30 text-foreground-secondary border border-border';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
    </span>
  );
}

function DetailsPanel({ details }: { details: Record<string, unknown> | null }) {
  const [open, setOpen] = React.useState(false);
  if (!details || Object.keys(details).length === 0) return <span className="text-foreground-secondary text-xs">—</span>;
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
      >
        Détails (JSON) <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <pre className="mt-2 text-xs bg-sidebar rounded-lg p-3 overflow-x-auto max-w-xs max-h-32 text-foreground-secondary font-mono">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function SuperAdminActivityLogPage() {
  const [logs, setLogs] = React.useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [filterAction, setFilterAction] = React.useState('');
  const [exporting, setExporting] = React.useState(false);

  const fetchLogs = async (cursor?: string, replace = false) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (cursor) params.set('cursor', cursor);
      if (filterAction) params.set('action', filterAction);
      const res = await apiClient.get(`/super-admin/activity-log?${params.toString()}`);
      const data = res.data as LogResponse;
      setLogs((prev) => replace ? data.data : [...prev, ...data.data]);
      setNextCursor(data.nextCursor);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    void fetchLogs(undefined, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAction]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get('/super-admin/activity-log/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-log-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const displayedLogs = search
    ? logs.filter((l) => {
        const q = search.toLowerCase();
        return (
          l.action.includes(q) ||
          l.actorId?.includes(q) ||
          l.targetType?.includes(q) ||
          l.targetId?.includes(q) ||
          l.ipAddress?.includes(q)
        );
      })
    : logs;

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort();

  return (
    <div>
      <PageHeader
        title="Journal d'activité"
        description={`${total.toLocaleString('fr-FR')} événements enregistrés`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => void fetchLogs(undefined, true)}
              className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-primary-light transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={() => void handleExport()}
              disabled={exporting}
              className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Export...' : 'Exporter CSV'}
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
          <input
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder="Search by Actor ID, Action, or Target"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">Toutes les actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
          ))}
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['All Events', 'Plans', 'Users', 'Missions', 'System'].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${
              tab === 'All Events'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-foreground-secondary hover:text-foreground hover:bg-primary-light'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable rows={10} />
      ) : displayedLogs.length === 0 ? (
        <EmptyState
          title="Aucun événement"
          description="Le journal d'activité est vide ou aucun résultat ne correspond."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sidebar border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary w-44">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Acteur</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Cible</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">IP</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-primary-light/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground-secondary whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {log.actorId ? (
                          <p className="font-mono text-xs text-foreground">{log.actorId.slice(0, 8)}…</p>
                        ) : (
                          <span className="text-foreground-secondary text-xs italic">système</span>
                        )}
                        {log.actorRole && (
                          <div><RoleBadge role={log.actorRole} /></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {log.targetType && (
                        <span className="text-xs text-foreground capitalize">{log.targetType}</span>
                      )}
                      {log.targetId && (
                        <span className="font-mono text-xs text-foreground-secondary block">{log.targetId.slice(0, 8)}…</span>
                      )}
                      {!log.targetType && !log.targetId && <span className="text-foreground-secondary text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground-secondary">
                      {log.ipAddress ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <DetailsPanel details={log.details} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">
              {displayedLogs.length} / {total.toLocaleString('fr-FR')} événements
            </span>
            {nextCursor && (
              <Button
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={() => void fetchLogs(nextCursor)}
                className="border-border hover:bg-primary-light text-foreground"
              >
                {loadingMore ? 'Chargement...' : 'Charger plus'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
