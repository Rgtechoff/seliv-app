'use client';

import * as React from 'react';
import { Search, Download, RefreshCw, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  plan_created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  plan_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  plan_deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  service_created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  service_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  service_deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  user_suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  user_unsuspended: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  user_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  mission_created: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  mission_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
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
  const color = ACTION_COLORS[action] ?? 'bg-muted text-muted-foreground';
  const label = ACTION_LABELS[action] ?? action.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function DetailsPanel({ details }: { details: Record<string, unknown> | null }) {
  const [open, setOpen] = React.useState(false);
  if (!details || Object.keys(details).length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        Détails <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <pre className="mt-1 text-xs bg-muted rounded p-2 overflow-x-auto max-w-xs max-h-32">
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
            <Button
              variant="outline"
              onClick={() => void fetchLogs(undefined, true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleExport()}
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Export...' : 'Exporter CSV'}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background text-sm"
            placeholder="Rechercher dans les logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-input rounded-lg px-3 py-2 bg-background text-sm"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">Toutes les actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={10} />
      ) : displayedLogs.length === 0 ? (
        <EmptyState
          title="Aucun événement"
          description="Le journal d'activité est vide ou aucun résultat ne correspond."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-44">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acteur</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cible</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {log.actorId ? (
                          <p className="font-mono text-xs">{log.actorId.slice(0, 8)}…</p>
                        ) : (
                          <span className="text-muted-foreground text-xs">système</span>
                        )}
                        {log.actorRole && (
                          <Badge variant="outline" className="text-xs mt-0.5">{log.actorRole}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.targetType && (
                        <span>{log.targetType}</span>
                      )}
                      {log.targetId && (
                        <span className="font-mono block">{log.targetId.slice(0, 8)}…</span>
                      )}
                      {!log.targetType && !log.targetId && '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
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

          {/* Pagination / Load more */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {displayedLogs.length} / {total.toLocaleString('fr-FR')} événements
            </span>
            {nextCursor && (
              <Button
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={() => void fetchLogs(nextCursor)}
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
