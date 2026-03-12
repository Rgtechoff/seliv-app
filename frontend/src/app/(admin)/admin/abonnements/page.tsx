'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { ExternalLink, RefreshCw, BadgeCheck, Zap, Users } from 'lucide-react';

interface SubscriptionRow {
  id: string;
  userId: string;
  plan: 'basic' | 'pro';
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  hourlyDiscount: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string | null;
  };
}

const PLAN_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
};

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    basic: 'bg-info/20 text-info border border-info/30',
    pro: 'bg-primary/10 text-primary border border-primary/30',
    business: 'bg-accent/20 text-accent border border-accent/30',
  };
  const cls = map[plan] ?? 'bg-muted text-foreground-secondary border border-border';
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-success/20 text-success border border-success/30',
    trialing: 'bg-info/20 text-info border border-info/30',
    canceled: 'bg-error/20 text-error border border-error/30',
    past_due: 'bg-error/20 text-error border border-error/30',
  };
  const cls = map[status] ?? 'bg-muted text-foreground-secondary border border-border';
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function AbonnementsPage() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const proCount = subscriptions.filter((s) => s.plan === 'pro').length;
  const basicCount = subscriptions.filter((s) => s.plan === 'basic').length;

  function load() {
    setLoading(true);
    adminApi
      .getSubscriptions()
      .then((r) => setSubscriptions((r.data.data as SubscriptionRow[]) ?? []))
      .catch(() =>
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les abonnements',
          variant: 'destructive',
        }),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Abonnements</h1>
          <p className="text-foreground-secondary text-sm mt-1">
            Gérez les abonnements vendeurs actifs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => window.open('https://dashboard.stripe.com/subscriptions', '_blank')}
            className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-primary-light transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Stripe Dashboard
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">Actifs</p>
              <p className="text-3xl font-bold text-foreground mt-2">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">Plan Pro</p>
              <p className="text-3xl font-bold text-foreground mt-2">{proCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">Plan Basic</p>
              <p className="text-3xl font-bold text-foreground mt-2">{basicCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            Liste des abonnements ({subscriptions.length})
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="px-6 py-10 text-center text-foreground-secondary text-sm">
            Aucun abonnement trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sidebar">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Vendeur</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Remise horaire</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Début</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Fin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border hover:bg-primary-light/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {sub.user
                            ? `${sub.user.firstName ?? ''} ${sub.user.lastName ?? ''}`.trim() ||
                              sub.user.email
                            : sub.userId}
                        </p>
                        {sub.user?.companyName && (
                          <p className="text-xs text-foreground-secondary">
                            {sub.user.companyName}
                          </p>
                        )}
                        {sub.user?.email && (
                          <p className="text-xs text-foreground-secondary">{sub.user.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={sub.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-foreground-secondary">
                      {sub.hourlyDiscount > 0 ? (
                        <span className="text-success font-medium">-{sub.hourlyDiscount}%</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {sub.currentPeriodStart
                        ? new Date(sub.currentPeriodStart).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
