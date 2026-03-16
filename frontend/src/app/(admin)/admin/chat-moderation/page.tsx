'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, CheckCircle, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlaggedMessage {
  id: string;
  missionId: string;
  senderId: string;
  content: string;
  isFlagged: boolean;
  flagReason?: string;
  chatPhase?: 'pre_acceptance' | 'post_acceptance';
  createdAt: string;
}

function FlagTypeBadge({ reason }: { reason?: string }) {
  if (!reason) return null;
  const map: Record<string, { cls: string; label: string }> = {
    contact_info: { cls: 'bg-warning/20 text-warning border border-warning/30', label: 'Contact info detected' },
    inappropriate: { cls: 'bg-error/20 text-error border border-error/30', label: 'Inappropriate language' },
    spam: { cls: 'bg-info/20 text-info border border-info/30', label: 'Potential spam' },
  };
  const entry = map[reason] ?? { cls: 'bg-muted text-foreground-secondary border border-border', label: reason };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${entry.cls}`}>
      <AlertTriangle className="w-3 h-3" />
      {entry.label}
    </span>
  );
}

function PhaseBadge({ phase }: { phase?: 'pre_acceptance' | 'post_acceptance' }) {
  if (!phase) return null;
  return (
    <span
      className={cn(
        'text-xs px-2 py-0.5 rounded-full font-medium',
        phase === 'pre_acceptance'
          ? 'bg-amber-900/30 text-amber-400'
          : 'bg-blue-900/30 text-blue-400',
      )}
    >
      {phase === 'pre_acceptance' ? 'Pré-acceptation' : 'Post-acceptation'}
    </span>
  );
}

export default function AdminChatModerationPage() {
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi.getFlaggedMessages().then((res) => {
      setMessages((res.data.data as FlaggedMessage[]) ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id: string) => {
    await adminApi.approveMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const remove = async (id: string) => {
    await adminApi.deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const blockedCount = messages.filter((m) => m.flagReason === 'contact_info').length;
  const flaggedCount = messages.filter((m) => m.isFlagged).length;
  const total = messages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages Signalés</h1>
        <p className="text-foreground-secondary text-sm mt-1">
          Gérez les violations des conditions d&apos;utilisation et les tentatives de contournement.
        </p>
      </div>

      {/* Stat cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-foreground-secondary">Bloqués</p>
            <p className="text-2xl font-bold text-red-400">{blockedCount}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-foreground-secondary">Flaggés</p>
            <p className="text-2xl font-bold text-amber-400">{flaggedCount}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-foreground-secondary">Total</p>
            <p className="text-2xl font-bold text-foreground">{total}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-success" />
          </div>
          <p className="font-semibold text-foreground">Aucun message signalé</p>
          <p className="text-foreground-secondary text-sm mt-1">La modération est à jour.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-card border border-warning/30 border-l-4 border-l-warning rounded-xl p-5 shadow-card"
            >
              {/* Top row: ID + reason + phase + date */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-foreground-secondary bg-sidebar px-2 py-0.5 rounded">
                    #{msg.id.slice(0, 8).toUpperCase()}
                  </span>
                  <FlagTypeBadge reason={msg.flagReason} />
                  <PhaseBadge phase={msg.chatPhase} />
                </div>
                <span className="text-xs text-foreground-secondary">
                  {format(new Date(msg.createdAt), 'dd MMM yyyy · HH:mm', { locale: fr })}
                </span>
              </div>

              {/* Message content */}
              <p className="text-sm text-foreground leading-relaxed mb-3">
                {msg.content}
              </p>

              {/* Context */}
              <p className="text-xs font-mono text-foreground-secondary mb-4">
                Mission : {msg.missionId.slice(0, 8)} · Envoyé par : {msg.senderId.slice(0, 8)}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => approve(msg.id)}
                  className="flex items-center gap-1.5 bg-success/20 text-success border border-success/30 hover:bg-success/30 rounded-lg text-xs px-3 py-1.5 transition-colors font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approuver
                </button>
                <button
                  onClick={() => remove(msg.id)}
                  className="flex items-center gap-1.5 bg-error/20 text-error border border-error/30 hover:bg-error/30 rounded-lg text-xs px-3 py-1.5 transition-colors font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
