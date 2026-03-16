'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  ArrowLeft,
  Send,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronUp,
} from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isPreset: boolean;
  isFlagged: boolean;
  isSystem: boolean;
  chatPhase: 'pre_acceptance' | 'post_acceptance';
  moderationAction?: 'allow' | 'flag';
  remaining_messages?: number | null;
  createdAt: string;
  isBlocked?: boolean;
}

interface ChatPreset {
  id: string;
  category: string;
  label: string;
}

interface MissionChatPageProps {
  missionId: string;
  backPath: string;
}

const QUICK_CHECK = /0[67]\d{8}|@\w+|gmail|hotmail|\bwhatsa?pp\b/i;

const WARNING_STORAGE_KEY = 'seliv_chat_warning_collapsed';

const PRE_ACCEPTANCE_PRESETS: ChatPreset[] = [
  { id: 'pre_1', category: 'Pré-acceptation', label: "Combien d'articles avez-vous exactement ?" },
  { id: 'pre_2', category: 'Pré-acceptation', label: 'Quels types de produits vendez-vous ?' },
  { id: 'pre_3', category: 'Pré-acceptation', label: 'Avez-vous déjà fait des lives ?' },
  { id: 'pre_4', category: 'Pré-acceptation', label: 'Le parking est-il accessible ?' },
  { id: 'pre_5', category: 'Pré-acceptation', label: "Quel est l'état général des articles ?" },
];

export function MissionChatPage({ missionId, backPath }: MissionChatPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiPresets, setApiPresets] = useState<ChatPreset[]>([]);
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'chat' | 'presets'>('chat');
  const [phase, setPhase] = useState<'pre_acceptance' | 'post_acceptance'>('pre_acceptance');
  const [remaining, setRemaining] = useState<number | null>(10);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [warningCollapsed, setWarningCollapsed] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [phaseJustChanged, setPhaseJustChanged] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load warning collapsed state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WARNING_STORAGE_KEY);
      if (stored === 'true') setWarningCollapsed(true);
    }
  }, []);

  const toggleWarning = useCallback(() => {
    setWarningCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(WARNING_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  // Fetch initial phase + messages + presets
  useEffect(() => {
    chatApi.getPhase(missionId).then((res) => {
      const d = res.data?.data;
      if (d) {
        setPhase((d.phase as 'pre_acceptance' | 'post_acceptance') ?? 'pre_acceptance');
        setRemaining(d.remaining ?? null);
        if (d.remaining === 0) setInputDisabled(true);
      }
    }).catch(() => {
      // fallback: keep defaults
    });

    chatApi.getMessages(missionId).then((res) => {
      const data = (res.data as { data: ChatMessage[] }).data ?? [];
      setMessages(data);
    }).catch(() => {});

    chatApi.getPresets().then((res) => {
      setApiPresets((res.data as { data: ChatPreset[] }).data ?? []);
    }).catch(() => {});
  }, [missionId]);

  // Socket connection
  useEffect(() => {
    if (!user) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('seliv_token') : null;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:4000';

    const socket = io(`${apiUrl}/chat`, {
      auth: { token, userId: user.id },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.emit('joinMission', missionId);

    socket.on('receiveMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.remaining_messages !== undefined && msg.remaining_messages !== null) {
        setRemaining(msg.remaining_messages);
        if (msg.remaining_messages === 0) setInputDisabled(true);
      }
      if (msg.remaining_messages === null && msg.chatPhase === 'post_acceptance') {
        setRemaining(null);
      }
    });

    socket.on('message_blocked', ({ reason }: { missionId: string; reason: string }) => {
      const blockedMsg: ChatMessage = {
        id: `blocked_${Date.now()}`,
        senderId: user.id,
        content: pendingText || 'Message non envoyé',
        isPreset: false,
        isFlagged: false,
        isSystem: false,
        chatPhase: phase,
        isBlocked: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, blockedMsg]);
      toast({
        title: 'Message bloqué',
        description: reason ?? 'Ce message ne peut pas être envoyé.',
        variant: 'destructive',
      });
    });

    socket.on('message_limit_reached', () => {
      setInputDisabled(true);
      setRemaining(0);
      toast({
        title: 'Limite atteinte',
        description: 'Vous avez atteint la limite de 10 messages avant acceptation.',
        variant: 'destructive',
      });
    });

    socket.on('phaseChanged', ({ newPhase }: { missionId: string; newPhase: string }) => {
      if (newPhase === 'post_acceptance') {
        setPhase('post_acceptance');
        setRemaining(null);
        setInputDisabled(false);
        setPhaseJustChanged(true);
        setTimeout(() => setPhaseJustChanged(false), 5000);
        toast({
          title: 'Mission acceptée !',
          description: 'Vous pouvez maintenant échanger librement.',
        });

        // Insert a system separator message
        const separatorMsg: ChatMessage = {
          id: `phase_change_${Date.now()}`,
          senderId: 'system',
          content: 'Chat illimité — Mission acceptée',
          isPreset: false,
          isFlagged: false,
          isSystem: true,
          chatPhase: 'post_acceptance',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, separatorMsg]);
      }
    });

    socket.on('userTyping', () => {
      // Could add typing indicator UI here
    });

    return () => {
      socket.emit('leaveMission', missionId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, user]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollDown(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const doSend = useCallback(
    (content: string, isPreset = false) => {
      if (!content.trim() || !socketRef.current || !user || inputDisabled) return;
      socketRef.current.emit('sendMessage', {
        missionId,
        content: content.trim(),
        isPreset,
        senderId: user.id,
      });
      if (!isPreset) {
        socketRef.current.emit('typing', { missionId, userId: user.id });
      }
    },
    [missionId, user, inputDisabled],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (QUICK_CHECK.test(trimmed)) {
      if (phase === 'pre_acceptance') {
        setPendingText(trimmed);
        setShowConfirmModal(true);
        return;
      } else {
        toast({
          title: 'Avertissement',
          description: 'Ce message semble contenir des informations de contact. Il pourrait être modéré.',
          variant: 'destructive',
        });
      }
    }

    doSend(trimmed);
    setText('');
  }, [text, phase, doSend, toast]);

  const confirmSend = useCallback(() => {
    doSend(pendingText);
    setText('');
    setPendingText('');
    setShowConfirmModal(false);
  }, [pendingText, doSend]);

  const sendPreset = useCallback(
    (label: string) => {
      doSend(label, true);
      setTab('chat');
    },
    [doSend],
  );

  const presetsToShow: ChatPreset[] =
    phase === 'pre_acceptance'
      ? PRE_ACCEPTANCE_PRESETS
      : apiPresets.length > 0
      ? apiPresets
      : PRE_ACCEPTANCE_PRESETS;

  const groupedPresets = presetsToShow.reduce<Record<string, ChatPreset[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar shrink-0">
        <button
          onClick={() => router.push(backPath)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground-secondary" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">Discussion</p>
          <p className="text-xs text-foreground-secondary truncate">
            Mission {missionId.slice(0, 8).toUpperCase()}
          </p>
        </div>
        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setTab('chat')}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-all',
              tab === 'chat'
                ? 'bg-sidebar text-foreground shadow-sm'
                : 'text-foreground-secondary hover:text-foreground',
            )}
          >
            Chat
          </button>
          <button
            onClick={() => setTab('presets')}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-all',
              tab === 'presets'
                ? 'bg-sidebar text-foreground shadow-sm'
                : 'text-foreground-secondary hover:text-foreground',
            )}
          >
            Présets
          </button>
        </div>
      </div>

      {/* Phase banner */}
      <AnimatePresence mode="wait">
        {phase === 'pre_acceptance' ? (
          <motion.div
            key="pre"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300 font-medium">
                  Phase de découverte — Chat limité
                </span>
              </div>
              {remaining !== null && (
                <span className="text-xs font-semibold text-amber-400">
                  {remaining} msg restant{remaining !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        ) : phaseJustChanged ? (
          <motion.div
            key="post_new"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-green-500/10 border-b border-green-500/20 px-4 py-2 shrink-0"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="text-xs text-green-300 font-medium">
                Mission acceptée — Échange libre activé
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Moderation warning (collapsible) */}
      <div
        className={cn(
          'border-b border-border shrink-0 transition-colors',
          phase === 'pre_acceptance'
            ? 'bg-amber-950/20 border-amber-500/10'
            : 'bg-muted/30',
        )}
      >
        <button
          onClick={toggleWarning}
          className="w-full flex items-center gap-2 px-4 py-2 text-left"
        >
          <AlertTriangle
            className={cn(
              'w-3.5 h-3.5 shrink-0',
              phase === 'pre_acceptance' ? 'text-amber-400' : 'text-foreground-secondary',
            )}
          />
          <span
            className={cn(
              'text-xs flex-1 truncate',
              phase === 'pre_acceptance'
                ? 'text-amber-300'
                : 'text-foreground-secondary',
            )}
          >
            {phase === 'pre_acceptance'
              ? 'Coordonnées et contacts interdits avant acceptation'
              : 'Respectez les conditions d\'utilisation'}
          </span>
          {warningCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-foreground-secondary shrink-0" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-foreground-secondary shrink-0" />
          )}
        </button>
        <AnimatePresence>
          {!warningCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  'text-xs px-4 pb-2 leading-relaxed',
                  phase === 'pre_acceptance'
                    ? 'text-amber-300/80'
                    : 'text-foreground-secondary',
                )}
              >
                {phase === 'pre_acceptance'
                  ? 'Numéros de téléphone, adresses email, liens et applications de messagerie externe sont interdits. Échangez uniquement via cette plateforme.'
                  : 'Les échanges de coordonnées directes restent déconseillés. Toute transaction hors plateforme annule vos garanties.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tab === 'chat' ? (
        <>
          {/* Messages zone */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-foreground-secondary">Aucun message pour le moment.</p>
                <p className="text-xs text-foreground-secondary/60 mt-1">Commencez la discussion !</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderId === user.id;

              // System message: phase separator or info
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-foreground-secondary/70 font-medium shrink-0 px-2">
                      {msg.content}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                );
              }

              // Blocked message (local only)
              if (msg.isBlocked) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ x: 0 }}
                    animate={{ x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm bg-red-950/40 border border-red-500/30 opacity-60">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="text-[10px] text-red-400 font-medium uppercase tracking-wide">
                          Non envoyé
                        </span>
                      </div>
                      <p className="text-foreground-secondary leading-relaxed line-through text-xs">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                );
              }

              // Normal message
              return (
                <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border text-foreground rounded-bl-sm',
                      msg.isFlagged && 'border-amber-500/40 bg-amber-950/20',
                    )}
                  >
                    {msg.isPreset && (
                      <span className="text-[10px] opacity-60 block mb-0.5 uppercase tracking-wide">
                        Message préset
                      </span>
                    )}
                    {msg.isFlagged && (
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-medium">Signalé</span>
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-1 text-right',
                        isMe ? 'opacity-70' : 'text-foreground-secondary',
                      )}
                    >
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollDown && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={scrollToBottom}
                className="absolute bottom-20 right-6 p-2 bg-primary rounded-full shadow-modal text-primary-foreground z-10"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="flex gap-2 p-4 border-t border-border bg-sidebar shrink-0">
            {inputDisabled ? (
              <div className="flex-1 flex items-center justify-center py-3 bg-muted/50 rounded-xl border border-border">
                <Lock className="w-4 h-4 text-foreground-secondary mr-2" />
                <span className="text-sm text-foreground-secondary">
                  Limite de messages atteinte
                </span>
              </div>
            ) : (
              <>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    phase === 'pre_acceptance'
                      ? `Votre message… (${remaining ?? 10} restant${(remaining ?? 10) !== 1 ? 's' : ''})`
                      : 'Votre message…'
                  }
                  className="flex-1 h-11 px-4 bg-input border border-border rounded-xl text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="h-11 w-11 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-xl flex items-center justify-center transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        /* Presets tab */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {phase === 'pre_acceptance' && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300">
                Présets adaptés à la phase de découverte
              </p>
            </div>
          )}
          {Object.entries(groupedPresets).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2 px-1">
                {category}
              </p>
              <div className="space-y-1.5">
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => sendPreset(p.label)}
                    disabled={inputDisabled}
                    className="w-full text-left text-sm px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal for suspicious content */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-modal"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Contenu suspect détecté</p>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    Votre message pourrait contenir des informations de contact.
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground-secondary mb-5 leading-relaxed">
                Partager des coordonnées avant l&apos;acceptation de la mission est interdit et peut
                entraîner la suspension de votre compte. Voulez-vous quand même envoyer ce message ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingText('');
                  }}
                  className="flex-1 h-10 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmSend}
                  className="flex-1 h-10 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Envoyer quand même
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
