'use client';

import * as React from 'react';
import {
  Search, ShieldOff, ShieldCheck, ExternalLink,
  ChevronUp, ChevronDown, StickyNote,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonTable } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatPrice } from '@/lib/types';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string | null;
  isSuspended: boolean;
  suspensionReason: string | null;
  lifetimeValueCents: number;
  missionsTotal: number;
  lastMissionAt: string | null;
  notesAdmin: string | null;
  createdAt: string;
}

type Segment = 'all' | 'new' | 'active' | 'inactive' | 'topSpenders';

const SEGMENT_LABELS: Record<Segment, string> = {
  all: 'Tous',
  new: 'Nouveaux',
  active: 'Actifs',
  inactive: 'Inactifs',
  topSpenders: 'Top dépenses',
};

function NotesModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [notes, setNotes] = React.useState(client.notesAdmin ?? '');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/super-admin/clients/${client.id}/notes`, { notes });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-1">
          Notes — {client.firstName} {client.lastName}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Notes internes visibles uniquement par l&apos;équipe.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <textarea
            className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-32 resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajouter une note sur ce client..."
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuspendModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [reason, setReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(`/super-admin/clients/${client.id}/suspend`, { reason });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-1">Suspendre {client.firstName} {client.lastName}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Le client ne pourra plus créer de missions.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Raison</label>
            <textarea
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-24 resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" variant="destructive" disabled={saving} className="flex-1">
              {saving ? 'Suspension...' : 'Suspendre'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperAdminClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [segment, setSegment] = React.useState<Segment>('all');
  const [sortBy, setSortBy] = React.useState<'ltv' | 'missions' | 'createdAt'>('ltv');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const [notesClient, setNotesClient] = React.useState<Client | null>(null);
  const [suspendingClient, setSuspendingClient] = React.useState<Client | null>(null);
  const [unsuspendingId, setUnsuspendingId] = React.useState<string | null>(null);

  const load = () => {
    apiClient.get('/super-admin/clients').then((res) => {
      setClients(res.data as Client[]);
    }).catch(console.error).finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const handleUnsuspend = async () => {
    if (!unsuspendingId) return;
    await apiClient.post(`/super-admin/clients/${unsuspendingId}/unsuspend`);
    setUnsuspendingId(null);
    load();
  };

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const filtered = clients
    .filter((c) => {
      const q = search.toLowerCase();
      if (q && !`${c.firstName} ${c.lastName} ${c.email} ${c.companyName ?? ''}`.toLowerCase().includes(q)) return false;
      if (segment === 'new' && new Date(c.createdAt) < thirtyDaysAgo) return false;
      if (segment === 'active' && (!c.lastMissionAt || new Date(c.lastMissionAt) < thirtyDaysAgo)) return false;
      if (segment === 'inactive' && c.lastMissionAt && new Date(c.lastMissionAt) >= ninetyDaysAgo) return false;
      if (segment === 'topSpenders' && c.lifetimeValueCents < 50000) return false;
      return true;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'ltv') diff = a.lifetimeValueCents - b.lifetimeValueCents;
      if (sortBy === 'missions') diff = a.missionsTotal - b.missionsTotal;
      if (sortBy === 'createdAt') diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? diff : -diff;
    });

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} clients inscrits`}
      />

      {/* Segment tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(Object.entries(SEGMENT_LABELS) as [Segment, string][]).map(([seg, label]) => (
          <button
            key={seg}
            onClick={() => setSegment(seg)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              segment === seg
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background text-sm"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun client trouvé"
          description="Modifiez vos filtres de recherche."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th
                    className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('ltv')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      LTV <SortIcon col="ltv" />
                    </span>
                  </th>
                  <th
                    className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('missions')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Missions <SortIcon col="missions" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dernière mission</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                        {c.companyName && (
                          <p className="text-xs text-muted-foreground">{c.companyName}</p>
                        )}
                        {c.notesAdmin && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                            <StickyNote className="w-3 h-3" />
                            {c.notesAdmin.slice(0, 50)}{c.notesAdmin.length > 50 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(c.lifetimeValueCents)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {c.missionsTotal}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(c.lastMissionAt)}
                    </td>
                    <td className="px-4 py-3">
                      {c.isSuspended ? (
                        <Badge variant="destructive" className="text-xs">Suspendu</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Actif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNotesClient(c)}
                          title="Notes admin"
                        >
                          <StickyNote className="w-3.5 h-3.5" />
                        </Button>
                        {c.isSuspended ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUnsuspendingId(c.id)}
                            title="Lever la suspension"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuspendingClient(c)}
                            title="Suspendre"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/admin/clients/${c.id}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
            {filtered.length} client{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {filtered.length !== clients.length && ` sur ${clients.length}`}
          </div>
        </div>
      )}

      {notesClient && (
        <NotesModal
          client={notesClient}
          onClose={() => setNotesClient(null)}
          onSaved={load}
        />
      )}

      {suspendingClient && (
        <SuspendModal
          client={suspendingClient}
          onClose={() => setSuspendingClient(null)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!unsuspendingId}
        onClose={() => setUnsuspendingId(null)}
        onConfirm={handleUnsuspend}
        title="Lever la suspension ?"
        description="Le client retrouvera l'accès complet à la plateforme."
        confirmLabel="Lever la suspension"
      />
    </div>
  );
}
