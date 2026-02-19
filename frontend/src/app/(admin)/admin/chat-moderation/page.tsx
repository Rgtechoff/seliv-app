'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FlaggedMessage {
  id: string;
  missionId: string;
  senderId: string;
  content: string;
  isFlagged: boolean;
  createdAt: string;
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Modération chat</h1>
      <p className="text-muted-foreground text-sm">
        Messages signalés automatiquement par le filtre de modération.
      </p>

      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun message signalé pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="destructive" className="mb-1">Signalé</Badge>
                    <p className="text-sm font-medium mt-1 break-all">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(msg.createdAt), 'dd/MM HH:mm', { locale: fr })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mission : {msg.missionId.slice(0, 8)} · Envoyé par : {msg.senderId.slice(0, 8)}
                </p>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => approve(msg.id)}>
                  Approuver
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(msg.id)}>
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
