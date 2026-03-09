'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, ShieldOff, ShieldCheck,
  Mail, Building2, Calendar, StickyNote,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonTable, SkeletonText } from '@/components/shared/skeleton';
import { formatPrice, type MissionStatus } from '@/lib/types';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string | null;
  siret: string | null;
  isSuspended: boolean;
  suspensionReason: string | null;
  lifetimeValueCents: number;
  missionsTotal: number;
  lastMissionAt: string | null;
  notesAdmin: string | null;
  createdAt: string;
}

interface Mission {
  id: string;
  status: MissionStatus;
  date: string;
  city: string;
  category: string;
  totalPrice: number;
}

interface ActivityEntry {
  id: string;
  action: string;
  targetType: string | null;
  createdAt: string;
}

interface HistoryData {
  client: Client;
  missions: Mission[];
  logs: ActivityEntry[];
}

type Tab = 'missions' | 'history';

const ACTION_LABELS: Record<string, string> = {
  mission_created: 'Mission créée',
  mission_updated: 'Mission mise à jour',
  mission_cancelled: 'Mission annulée',
  user_suspended: 'Compte suspendu',
  user_unsuspended: 'Suspension levée',
};

function SuspendModal({
  client, onClose, onSaved,
}: { client: Client; onClose: () => void; onSaved: () => void }) {
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
        <h2 className="text-lg font-semibold mb-1">
          Suspendre {client.firstName} {client.lastName}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Le client ne pourra plus créer de nouvelles missions.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <textarea
            className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-24 resize-none"
            placeholder="Raison de la suspension..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
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

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = React.useState<HistoryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<Tab>('missions');
  const [notes, setNotes] = React.useState('');
  const [notesSaving, setNotesSaving] = React.useState(false);
  const [notesSaved, setNotesSaved] = React.useState(false);
  const [showSuspend, setShowSuspend] = React.useState(false);
  const [unsuspendOpen, setUnsuspendOpen] = React.useState(false);

  const load = () => {
    setLoading(true);
    apiClient.get(`/super-admin/clients/${id}/history`)
      .then((res) => {
        const d = res.data as HistoryData;
        setData(d);
        setNotes(d.client.notesAdmin ?? '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { load(); }, [id]);

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      await apiClient.put(`/super-admin/clients/${id}/notes`, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setNotesSaving(false);
    }
  };

  const handleUnsuspend = async () => {
    await apiClient.post(`/super-admin/clients/${id}/unsuspend`);
    setUnsuspendOpen(false);
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

  if (!data) return <p className="text-muted-foreground">Client introuvable.</p>;

  const { client, missions, logs } = data;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'missions', label: 'Missions', count: missions.length },
    { key: 'history', label: 'Historique', count: logs.length },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary-foreground text-2xl font-bold flex-shrink-0">
            {client.firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">
                {client.firstName} {client.lastName}
              </h1>
              {client.isSuspended && <Badge variant="destructive">Suspendu</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</span>
              {client.companyName && (
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{client.companyName}</span>
              )}
              {client.siret && <span className="font-mono text-xs">SIRET: {client.siret}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {client.suspensionReason && (
              <p className="text-sm text-red-500 mt-2">Raison suspension : {client.suspensionReason}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center shrink-0">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(client.lifetimeValueCents)}</p>
              <p className="text-xs text-muted-foreground">LTV</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{client.missionsTotal}</p>
              <p className="text-xs text-muted-foreground">Missions</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {client.lastMissionAt
                  ? new Date(client.lastMissionAt).toLocaleDateString('fr-FR')
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Dernière mission</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-border">
          {client.isSuspended ? (
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

      {/* Notes admin */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-foreground">Notes internes</h2>
          <span className="text-xs text-muted-foreground">(visibles uniquement par l&apos;équipe)</span>
        </div>
        <textarea
          className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm h-24 resize-none"
          placeholder="Ajouter une note sur ce client..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" onClick={() => void handleSaveNotes()} disabled={notesSaving}>
            {notesSaving ? 'Sauvegarde...' : notesSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </Button>
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
                    <td className="px-4 py-3 text-muted-foreground">{new Date(m.date).toLocaleDateString('fr-FR')}</td>
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

      {showSuspend && (
        <SuspendModal
          client={client}
          onClose={() => setShowSuspend(false)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={unsuspendOpen}
        onClose={() => setUnsuspendOpen(false)}
        onConfirm={handleUnsuspend}
        title="Lever la suspension ?"
        description="Le client retrouvera l'accès complet à la plateforme."
        confirmLabel="Lever la suspension"
      />
    </div>
  );
}
