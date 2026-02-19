'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, RefreshCw } from 'lucide-react';

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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  trialing: 'secondary',
  canceled: 'destructive',
  past_due: 'destructive',
};

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Abonnements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les abonnements vendeurs actifs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open('https://dashboard.stripe.com/subscriptions', '_blank')
            }
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Stripe Dashboard
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-3xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Plan Pro</p>
            <p className="text-3xl font-bold">{proCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Plan Basic</p>
            <p className="text-3xl font-bold">{basicCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun abonnement trouvé.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendeur</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Remise horaire</TableHead>
                  <TableHead>Période en cours</TableHead>
                  <TableHead>Fin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {sub.user
                            ? `${sub.user.firstName ?? ''} ${sub.user.lastName ?? ''}`.trim() ||
                              sub.user.email
                            : sub.userId}
                        </p>
                        {sub.user?.companyName && (
                          <p className="text-xs text-muted-foreground">
                            {sub.user.companyName}
                          </p>
                        )}
                        {sub.user?.email && (
                          <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.plan === 'pro' ? 'default' : 'secondary'}
                      >
                        {PLAN_LABELS[sub.plan] ?? sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[sub.status] ?? 'outline'}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.hourlyDiscount > 0 ? `-${sub.hourlyDiscount}%` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.currentPeriodStart
                        ? new Date(sub.currentPeriodStart).toLocaleDateString('fr-FR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
