'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Star, ShieldOff, ShieldCheck,
  MapPin, Mail, Calendar,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonTable, SkeletonText } from '@/components/shared/skeleton';
import { formatPrice, type MissionStatus } from '@/lib/types';

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
  bio: string | null;
  avatarUrl: string | null;
  zones: string[];
  categories: string[];
  lastActiveAt: string | null;
  createdAt: string;
}

interface Mission {
  id: string;
  status: MissionStatus;
  date: string;
  city: string;
  category: string;
  totalPrice: number;
  clientId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
}

interface ActivityEntry {
  id: string;
  action: string;
  targetType: string | null;
  createdAt: string;
}

interface HistoryData {
  vendeur: Vendeur;
  missions: Mission[];
  reviews: Review[];
  logs: ActivityEntry[];
}

type Tab = 'missions' | 'reviews' | 'history' | 'stats';

const ACTION_LABELS: Record<string, string> = {
  mission_created: 'Mission créée',
  mission_updated: 'Mission mise à jour',
  plan_updated: 'Plan modifié',
  user_suspended: 'Suspendu',
  user_unsuspended: 'Suspension levée',
};

const LEVEL_LABELS: Record<VendorLevel, string> = {
  debutant: 'Débutant',
  confirme: 'Confirmé',
  expert: 'Expert',
};

export default function VendeurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = React.useState<HistoryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<Tab>('missions');
  const [showSuspend, setShowSuspend] = React.useState(false);
  const [suspendReason, setSuspendReason] = React.useState('');
  const [suspendLoading, setSuspendLoading] = React.useState(false);
  const [unsuspendOpen, setUnsuspendOpen] = React.useState(false);

  const load = () => {
    setLoading(true);
    apiClient.get(`/super-admin/vendeurs/${id}/history`)
      .then((res) => setData(res.data as HistoryData))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { load(); }, [id]);

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuspendLoading(true);
    try {
      await apiClient.post(`/super-admin/vendeurs/${id}/suspend`, { reason: suspendReason });
      setShowSuspend(false);
      setSuspendReason('');
      load();
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    await apiClient.post(`/super-admin/vendeurs/${id}/unsuspend`);
    setUnsuspendOpen(false);
    load();
  };

  const handleToggleStar = async () => {
    await apiClient.post(`/super-admin/vendeurs/${id}/toggle-star`);
    load();
  };

  const handleLevelChange = async (level: VendorLevel) => {
    await apiClient.put(`/super-admin/vendeurs/${id}/level`, { level });
    load();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <SkeletonText lines={4} />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Vendeur introuvable.</p>;

  const { vendeur, missions, reviews, logs } = data;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'missions', label: 'Missions', count: missions.length },
    { key: 'reviews', label: 'Avis', count: reviews.length },
    { key: 'history', label: 'Historique', count: logs.length },
    { key: 'stats', label: 'Stats', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
            {vendeur.firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">
                {vendeur.firstName} {vendeur.lastName}
              </h1>
              {vendeur.isStar && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
              {vendeur.isSuspended && <Badge variant="destructive">Suspendu</Badge>}
              {vendeur.level && (
                <Badge variant="outline">{LEVEL_LABELS[vendeur.level]}</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{vendeur.email}</span>
              {vendeur.zones.length > 0 && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{vendeur.zones.join(', ')}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Inscrit le {new Date(vendeur.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {vendeur.bio && (
              <p className="text-sm text-muted-foreground mt-2 italic">{vendeur.bio}</p>
            )}
            {vendeur.suspensionReason && (
              <p className="text-sm text-red-500 mt-2">
                Raison suspension : {vendeur.suspensionReason}
              </p>
            )}
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4 text-center shrink-0">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(vendeur.totalRevenueGeneratedCents)}</p>
              <p className="text-xs text-muted-foreground">CA généré</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{vendeur.missionsTotal}</p>
              <p className="text-xs text-muted-foreground">Missions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Note moy.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border">
          <select
            className="border border-input rounded-lg px-3 py-1.5 bg-background text-sm"
            value={vendeur.level ?? ''}
            onChange={(e) => void handleLevelChange(e.target.value as VendorLevel)}
          >
            <option value="">Niveau : —</option>
            {(Object.entries(LEVEL_LABELS) as [VendorLevel, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => void handleToggleStar()}>
            <Star className={`w-4 h-4 mr-1 ${vendeur.isStar ? 'text-amber-500 fill-amber-500' : ''}`} />
            {vendeur.isStar ? 'Retirer Star' : 'Passer Star'}
          </Button>
          {vendeur.isSuspended ? (
            <Button variant="outline" size="sm" onClick={() => setUnsuspendOpen(true)}>
              <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
              Lever la suspension
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => setShowSuspend(true)}>
              <ShieldOff className="w-4 h-4 mr-1" />
              Suspendre
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}{count > 0 ? ` (${count})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'missions' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ville</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {missions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucune mission</td></tr>
                ) : missions.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(m.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">{m.city}</td>
                    <td className="px-4 py-3 capitalize">{m.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} variant="dot" /></td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(m.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">Aucun avis.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${r.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                </span>
                {!r.isVisible && <Badge variant="secondary" className="text-xs">Masqué</Badge>}
              </div>
              {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {logs.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Aucun événement.</p>}
          {logs.map((log) => (
            <div key={log.id} className="px-4 py-3 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  {ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')}
                  {log.targetType && <span className="text-muted-foreground"> ({log.targetType})</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total missions', value: vendeur.missionsTotal },
            { label: 'CA généré', value: formatPrice(vendeur.totalRevenueGeneratedCents) },
            { label: 'Avis reçus', value: reviews.length },
            { label: 'Note moyenne', value: avgRating ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Suspend modal */}
      {showSuspend && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">
              Suspendre {vendeur.firstName} {vendeur.lastName}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Le vendeur ne pourra plus accéder à la plateforme.
            </p>
            <form onSubmit={(e) => void handleSuspend(e)} className="space-y-4">
              <textarea
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-24 resize-none"
                placeholder="Raison de la suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSuspend(false)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" disabled={suspendLoading} className="flex-1">
                  {suspendLoading ? 'Suspension...' : 'Suspendre'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={unsuspendOpen}
        onClose={() => setUnsuspendOpen(false)}
        onConfirm={handleUnsuspend}
        title="Lever la suspension ?"
        description="Le vendeur retrouvera l'accès complet à la plateforme."
        confirmLabel="Lever la suspension"
      />
    </div>
  );
}
