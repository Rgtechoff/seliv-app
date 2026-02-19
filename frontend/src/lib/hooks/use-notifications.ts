'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsApi } from '@/lib/api';
import type { Notification } from '@/lib/types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Initial fetch
  useEffect(() => {
    notificationsApi
      .getAll()
      .then((res) => setNotifications(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Real-time via WebSocket
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('seliv_token')
        : null;

    if (!token) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('notification', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
