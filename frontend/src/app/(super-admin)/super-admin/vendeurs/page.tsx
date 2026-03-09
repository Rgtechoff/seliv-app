'use client';

import * as React from 'react';
import {
  Search, Star, StarOff, ShieldOff, ShieldCheck,
  ChevronUp, ChevronDown, ExternalLink,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonTable } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { InlineEdit } from '@/components/shared/inline-edit';
import { formatPrice } from '@/lib/types';

type VendorLevel = 'debutant' | 'confirme' | 'expert';

interface Vendeur {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: VendorLevel | null;
  isStar: boolean;
  isValidated: boolean;
  isSuspended: boolean;
  suspensionReason: string | null;
  totalRevenueGeneratedCents: number;
  commissionRate: number | null;
  missionsTotal: number;
  lastActiveAt: string | null;
  createdAt: string;
}

const LEVEL_LABELS: Record<VendorLevel, string> = {
  debutant: 'Débutant',
  confirme: 'Confirmé',
  expert: 'Expert',
};

const LEVEL_COLORS: Record<VendorLevel, string> = {
  debutant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  confirme: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  expert: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function SuspendModal({
  vendeur,
  onClose,
  onSaved,
}: {
  vendeur: Vendeur;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [reason, setReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(`/super-admin/vendeurs/${vendeur.id}/suspend`, { reason });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-1">Suspendre {vendeur.firstName} {vendeur.lastName}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Le vendeur ne pourra plus accéder à la plateforme.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Raison de la suspension</label>
            <textarea
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-24 resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez la raison..."
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

export default function SuperAdminVendeursPage() {
  const [vendeurs, setVendeurs] = React.useState<Vendeur[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterLevel, setFilterLevel] = React.useState<VendorLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'active' | 'suspended' | 'star'>('all');
  const [sortBy, setSortBy] = React.useState<'revenue' | 'missions' | 'createdAt'>('revenue');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const [suspendingVendeur, setSuspendingVendeur] = React.useState<Vendeur | null>(null);
  const [unsuspendingId, setUnsuspendingId] = React.useState<string | null>(null);

  const load = () => {
    apiClient.get('/super-admin/vendeurs').then((res) => {
      setVendeurs(res.data as Vendeur[]);
    }).catch(console.error).finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const handleToggleStar = async (id: string) => {
    await apiClient.post(`/super-admin/vendeurs/${id}/toggle-star`);
    load();
  };

  const handleUnsuspend = async () => {
    if (!unsuspendingId) return;
    await apiClient.post(`/super-admin/vendeurs/${unsuspendingId}/unsuspend`);
    setUnsuspendingId(null);
    load();
  };

  const handleUpdateLevel = async (id: string, level: VendorLevel) => {
    await apiClient.put(`/super-admin/vendeurs/${id}/level`, { level });
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

  const filtered = vendeurs
    .filter((v) => {
      const q = search.toLowerCase();
      if (q && !`${v.firstName} ${v.lastName} ${v.email}`.toLowerCase().includes(q)) return false;
      if (filterLevel !== 'all' && v.level !== filterLevel) return false;
      if (filterStatus === 'active' && v.isSuspended) return false;
      if (filterStatus === 'suspended' && !v.isSuspended) return false;
      if (filterStatus === 'star' && !v.isStar) return false;
      return true;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'revenue') diff = a.totalRevenueGeneratedCents - b.totalRevenueGeneratedCents;
      if (sortBy === 'missions') diff = a.missionsTotal - b.missionsTotal;
      if (sortBy === 'createdAt') diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? diff : -diff;
    });

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div>
      <PageHeader
        title="Vendeurs"
        description={`${vendeurs.length} vendeurs inscrits`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background text-sm"
            placeholder="Rechercher un vendeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-input rounded-lg px-3 py-2 bg-background text-sm"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as VendorLevel | 'all')}
        >
          <option value="all">Tous niveaux</option>
          {Object.entries(LEVEL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="border border-input rounded-lg px-3 py-2 bg-background text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
          <option value="star">Stars</option>
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun vendeur trouvé"
          description="Modifiez vos filtres de recherche."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vendeur</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Niveau</th>
                  <th
                    className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('revenue')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      CA généré <SortIcon col="revenue" />
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Commission</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.isStar && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-foreground">{v.firstName} {v.lastName}</p>
                          <p className="text-xs text-muted-foreground">{v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                          v.level ? LEVEL_COLORS[v.level] : 'bg-muted text-muted-foreground'
                        }`}
                        value={v.level ?? ''}
                        onChange={(e) => void handleUpdateLevel(v.id, e.target.value as VendorLevel)}
                      >
                        <option value="">—</option>
                        {Object.entries(LEVEL_LABELS).map(([k, l]) => (
                          <option key={k} value={k}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(v.totalRevenueGeneratedCents)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {v.missionsTotal}
                    </td>
                    <td className="px-4 py-3">
                      <InlineEdit
                        value={v.commissionRate !== null ? `${v.commissionRate}%` : '—'}
                        onSave={async (val) => {
                          const num = parseFloat(val.replace('%', ''));
                          if (!isNaN(num)) {
                            await apiClient.put(`/super-admin/vendeurs/${v.id}/commission`, { commissionRate: num });
                            load();
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {v.isSuspended ? (
                        <Badge variant="destructive" className="text-xs">Suspendu</Badge>
                      ) : v.isValidated ? (
                        <Badge variant="default" className="text-xs">Validé</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">En attente</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleToggleStar(v.id)}
                          title={v.isStar ? 'Retirer Star' : 'Passer Star'}
                        >
                          {v.isStar
                            ? <StarOff className="w-3.5 h-3.5 text-amber-500" />
                            : <Star className="w-3.5 h-3.5" />}
                        </Button>
                        {v.isSuspended ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUnsuspendingId(v.id)}
                            title="Lever la suspension"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuspendingVendeur(v)}
                            title="Suspendre"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={`/admin/vendeurs/${v.id}`} target="_blank" rel="noreferrer">
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
            {filtered.length} vendeur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {filtered.length !== vendeurs.length && ` sur ${vendeurs.length}`}
          </div>
        </div>
      )}

      {suspendingVendeur && (
        <SuspendModal
          vendeur={suspendingVendeur}
          onClose={() => setSuspendingVendeur(null)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!unsuspendingId}
        onClose={() => setUnsuspendingId(null)}
        onConfirm={handleUnsuspend}
        title="Lever la suspension ?"
        description="Le vendeur retrouvera l'accès complet à la plateforme."
        confirmLabel="Lever la suspension"
      />
    </div>
  );
}
