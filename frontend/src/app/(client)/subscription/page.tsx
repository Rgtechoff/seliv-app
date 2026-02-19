'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { subscriptionsApi } from '@/lib/api';
import { formatPrice, type Subscription } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    price: 2900,
    features: ['Tarif horaire standard', 'Accès aux missions disponibles', 'Support email'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 7900,
    features: [
      'Réduction 10€/h sur toutes les missions',
      'Priorité dans les mises en relation',
      'Support prioritaire',
      'Statistiques avancées',
    ],
  },
];

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    subscriptionsApi.getMy().then((res) => {
      setSub(res.data.data as Subscription);
    }).catch(() => setSub(null)).finally(() => setLoading(false));
  }, []);

  const subscribe = async (plan: string) => {
    setCheckoutLoading(plan);
    try {
      const res = await subscriptionsApi.createCheckout(plan);
      const { url } = res.data.data as { url: string };
      window.location.href = url;
    } catch {
      alert('Erreur lors de la redirection vers le paiement');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Abonnement</h1>
        {sub && (
          <p className="text-muted-foreground text-sm mt-1">
            Plan actuel : <span className="font-medium capitalize">{sub.plan}</span>
            {' '}— statut : <span className="capitalize">{sub.status}</span>
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isActive = sub?.plan === plan.key && sub?.status === 'active';
          return (
            <Card key={plan.key} className={isActive ? 'border-primary ring-1 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isActive && <Badge>Actif</Badge>}
                </div>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(plan.price)}
                  </span>
                  /mois
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isActive && (
                  <Button
                    className="w-full"
                    disabled={checkoutLoading === plan.key}
                    onClick={() => subscribe(plan.key)}
                  >
                    {checkoutLoading === plan.key ? 'Redirection…' : `Choisir ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
