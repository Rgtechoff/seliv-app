'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { chatApi, type Conversation } from '@/lib/api';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm', { locale: fr });
  if (isYesterday(d)) return 'Hier';
  return format(d, 'dd MMM', { locale: fr });
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente',
  paid: 'Payée',
  assigned: 'Assignée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

interface ConversationsListProps {
  basePath: string; // '/messages' for client, '/vendeur/messages' for vendeur
}

export function ConversationsList({ basePath }: ConversationsListProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatApi
      .getConversations()
      .then((res) => setConversations(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <p className="font-semibold text-foreground">Aucune conversation</p>
        <p className="text-foreground-secondary text-sm mt-1">
          Vos discussions de mission apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const other = conv.otherParticipant;
        const hasLastMsg = !!conv.lastMessage;

        return (
          <button
            key={conv.missionId}
            onClick={() => router.push(`${basePath}/${conv.missionId}`)}
            className={cn(
              'w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3',
              'hover:border-primary/40 hover:bg-primary/5 transition-all text-left group',
            )}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
              {other
                ? getInitials(other.firstName, other.lastName)
                : <MessageSquare className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground text-sm truncate">
                  {other
                    ? `${other.firstName} ${other.lastName}`
                    : 'Mission sans vendeur'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasLastMsg && (
                    <span className="text-xs text-foreground-secondary">
                      {formatTime(conv.lastMessage!.createdAt)}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-foreground-secondary group-hover:text-primary transition-colors" />
                </div>
              </div>
              <p className="text-xs text-foreground-secondary truncate mt-0.5">
                {conv.category} · {conv.city}
              </p>
              {hasLastMsg ? (
                <p className="text-xs text-foreground-secondary truncate mt-1">
                  {conv.lastMessage!.content}
                </p>
              ) : (
                <p className="text-xs text-foreground-secondary/60 italic mt-1">
                  Aucun message
                </p>
              )}
            </div>

            {/* Status badge */}
            <span className="hidden sm:inline-flex shrink-0 text-xs px-2 py-0.5 rounded-full bg-muted text-foreground-secondary">
              {STATUS_LABEL[conv.status] ?? conv.status}
            </span>
          </button>
        );
      })}
    </div>
  );
}
