'use client';

import * as React from 'react';
import {
  Search, Star, StarOff, ShieldOff, ShieldCheck,
  ChevronUp, ChevronDown, ExternalLink,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
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
  debutant: 'bg-muted/30 text-foreground-secondary border border-border',
  confirme: 'bg-info/20 text-info border border-info/30',
  expert: 'bg-accent/20 text-accent border border-accent/30',
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 shadow-modal">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Suspendre {vendeur.firstName} {vendeur.lastName}
        </h2>
        <p className="text-sm text-foreground-secondary mb-4">
          Le vendeur ne pourra plus accéder à la plateforme.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Raison de la suspension</label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm text-foreground placeholder:text-foreground-secondary h-24 resize-none focus:outline-none focus:border-primary transition-colors"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez la raison..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border bg-transparent hover:bg-primary-light text-foreground rounded-lg py-2 text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-error/20 text-error border border-error/30 hover:bg-error/30 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Suspension...' : 'Suspendre'}
            </button>
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

      {/* Filtres chips statut */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(['all', 'active', 'suspended', 'star'] as const).map((s) => {
          const labels = { all: 'Tous', active: 'Actifs', suspended: 'Suspendus', star: 'Stars' };
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filterStatus === s
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground-secondary hover:text-foreground hover:bg-primary-light'
              }`}
            >
              {labels[s]}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
          <input
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder="Rechercher un vendeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as VendorLevel | 'all')}
        >
          <option value="all">Tous niveaux</option>
          {Object.entries(LEVEL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
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
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sidebar border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Vendeur</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Niveau</th>
                  <th
                    className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('revenue')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      CA généré <SortIcon col="revenue" />
                    </span>
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('missions')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Missions <SortIcon col="missions" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Commission</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-primary-light/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {v.firstName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            {v.isStar && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                            <p className="font-medium text-foreground">{v.firstName} {v.lastName}</p>
                          </div>
                          <p className="text-xs text-foreground-secondary">{v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`text-xs font-medium px-2 py-1 rounded border cursor-pointer bg-transparent ${
                          v.level ? LEVEL_COLORS[v.level] : 'text-foreground-secondary border-border'
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
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatPrice(v.totalRevenueGeneratedCents)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground-secondary">
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
                        <span className="bg-error/20 text-error border border-error/30 rounded text-xs px-2 py-0.5">Suspendu</span>
                      ) : v.isValidated ? (
                        <span className="bg-success/20 text-success border border-success/30 rounded text-xs px-2 py-0.5">Validé</span>
                      ) : (
                        <span className="bg-warning/20 text-warning border border-warning/30 rounded text-xs px-2 py-0.5">En attente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => void handleToggleStar(v.id)}
                          title={v.isStar ? 'Retirer Star' : 'Passer Star'}
                          className="p-1.5 rounded-lg hover:bg-primary-light transition-colors"
                        >
                          {v.isStar
                            ? <StarOff className="w-3.5 h-3.5 text-amber-400" />
                            : <Star className="w-3.5 h-3.5 text-foreground-secondary" />}
                        </button>
                        {v.isSuspended ? (
                          <button
                            onClick={() => setUnsuspendingId(v.id)}
                            title="Lever la suspension"
                            className="p-1.5 rounded-lg hover:bg-success/20 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-success" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendingVendeur(v)}
                            title="Suspendre"
                            className="p-1.5 rounded-lg hover:bg-error/20 transition-colors"
                          >
                            <ShieldOff className="w-3.5 h-3.5 text-error" />
                          </button>
                        )}
                        <a
                          href={`/super-admin/vendeurs/${v.id}`}
                          className="p-1.5 rounded-lg hover:bg-primary-light transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-foreground-secondary" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-sm text-foreground-secondary">
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
