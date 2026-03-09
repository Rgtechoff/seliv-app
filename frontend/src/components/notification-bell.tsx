'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { notificationsApi } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

function groupByDay(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const key = isToday(d) ? 'Aujourd\'hui' : isYesterday(d) ? 'Hier' : format(d, 'dd MMMM', { locale: fr });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prevUnread, setPrevUnread] = useState(0);
  const [bounce, setBounce] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    notificationsApi.getAll().then((res) => {
      setNotifications((res.data.data as Notification[]) ?? []);
    });
  }, []);

  // Bounce animation when new notifications arrive
  useEffect(() => {
    if (unread > prevUnread) {
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }
    setPrevUnread(unread);
  }, [unread, prevUnread]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAll = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const grouped = groupByDay(notifications.slice(0, 30));

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="relative"
      >
        <motion.div
          animate={bounce ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-background shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs text-primary hover:underline">
                    Tout lire
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune notification</p>
                </div>
              ) : (
                grouped.map(({ label, items }) => (
                  <div key={label}>
                    <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground bg-muted/40 sticky top-0">
                      {label}
                    </p>
                    {items.map((n) => (
                      <motion.div
                        key={n.id}
                        onClick={() => void markRead(n.id)}
                        whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                        className={`cursor-pointer px-4 py-3 border-b border-border last:border-0 transition-colors ${
                          !n.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          )}
                          <div className={!n.isRead ? '' : 'pl-3.5'}>
                            <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {format(new Date(n.createdAt), 'HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
