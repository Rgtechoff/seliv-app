'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatApi } from '@/lib/api';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isPreset: boolean;
  isFlagged: boolean;
  isSystem: boolean;
  createdAt: string;
}

interface ChatPreset {
  id: string;
  category: string;
  label: string;
}

interface ChatWidgetProps {
  missionId: string;
  currentUser: User;
}

export function ChatWidget({ missionId, currentUser }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presets, setPresets] = useState<ChatPreset[]>([]);
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'messages' | 'presets'>('messages');
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getMessages(missionId).then((res) => {
      setMessages((res.data.data as ChatMessage[]) ?? []);
    });
    chatApi.getPresets().then((res) => {
      setPresets((res.data.data as ChatPreset[]) ?? []);
    });
  }, [missionId]);

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem('seliv_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:4000';
    const socket = io(`${apiUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.emit('joinMission', { missionId });
    socket.on('newMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.disconnect();
    };
  }, [open, missionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendText = () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { missionId, content: text.trim() });
    setText('');
  };

  const sendPreset = (label: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('sendMessage', { missionId, content: label, isPreset: true });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="flex flex-col w-80 h-96 rounded-lg border bg-background shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('messages')}
                className={`text-xs px-2 py-1 rounded ${tab === 'messages' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                Messages
              </button>
              <button
                onClick={() => setTab('presets')}
                className={`text-xs px-2 py-1 rounded ${tab === 'presets' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                Présets
              </button>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {tab === 'messages' ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  if (msg.isSystem) {
                    return (
                      <p key={msg.id} className="text-xs text-center text-muted-foreground italic">
                        {msg.content}
                      </p>
                    );
                  }
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-1.5 text-sm ${
                          isMe
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-[10px] opacity-70 text-right mt-0.5">
                          {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 p-2 border-t">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendText()}
                  placeholder="Votre message..."
                  className="h-8 text-sm"
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendText}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => sendPreset(p.label)}
                  className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => setOpen(true)}>
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
