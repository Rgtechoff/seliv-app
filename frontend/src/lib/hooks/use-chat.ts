'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '@/lib/api';

export interface ChatMessage {
  id: string;
  missionId: string;
  senderId: string;
  senderName?: string;
  content: string;
  isFlagged: boolean;
  createdAt: string;
}

export interface ChatPreset {
  id: string;
  content: string;
  category?: string;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

export function useChat(missionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presets, setPresets] = useState<ChatPreset[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Load history + presets
  useEffect(() => {
    if (!missionId) return;

    setLoading(true);
    Promise.all([
      chatApi.getMessages(missionId),
      chatApi.getPresets(),
    ])
      .then(([msgsRes, presetsRes]) => {
        setMessages(msgsRes.data ?? []);
        setPresets(presetsRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [missionId]);

  // WebSocket connection
  useEffect(() => {
    if (!missionId) return;

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('seliv_token')
        : null;

    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinMission', { missionId });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('newMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [missionId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !missionId || !content.trim()) return;
      socketRef.current.emit('sendMessage', { missionId, content });
    },
    [missionId],
  );

  const sendPreset = useCallback(
    (preset: ChatPreset) => {
      sendMessage(preset.content);
    },
    [sendMessage],
  );

  return { messages, presets, connected, loading, sendMessage, sendPreset };
}
