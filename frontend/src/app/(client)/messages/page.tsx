import { MessageSquare } from 'lucide-react';
import { ConversationsList } from '@/components/conversations-list';

export const metadata = { title: 'Messages' };

export default function ClientMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-foreground-secondary">Vos discussions avec les vendeurs</p>
        </div>
      </div>

      <ConversationsList basePath="/messages" />
    </div>
  );
}
