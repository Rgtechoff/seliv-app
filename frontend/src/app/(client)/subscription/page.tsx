'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscriptionsApi } from '@/lib/api';
import { type Subscription } from '@/lib/types';
import { CheckCircle, XCircle, Zap, ArrowLeft, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 0,
    features: [
      { text: '3 Projects', included: true },
      { text: 'Basic Analytics', included: true },
      { text: 'Custom Domain', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 2900,
    popular: true,
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Custom Domain', included: true },
    ],
  },
  {
    key: 'business',
    name: 'Business',
    price: 9900,
    features: [
      { text: '10 Team Members', included: true },
      { text: 'API Access', included: true },
      { text: '24/7 Priority Support', included: true },
    ],
  },
];

const BILLING_HISTORY = [
  { date: 'Sep 12, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', invoice: '#' },
  { date: 'Aug 12, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', invoice: '#' },
  { date: 'Jul 12, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', invoice: '#' },
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

  const currentPlanKey = sub?.plan ?? 'pro'; // default to pro for display

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center h-9 w-9 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Subscription</h1>
          <p className="text-xs text-foreground-secondary">Manage your SELIV workspace plan</p>
        </div>
      </div>

      {/* Current plan */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Current Plan</p>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mx-auto mb-3">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-foreground capitalize">{sub?.plan ?? 'Pro'} Plan</h2>
            <span className="text-xs bg-success/15 text-success border border-success/30 rounded-full px-2 py-0.5 font-medium">
              ACTIVE
            </span>
          </div>
          <p className="text-sm text-foreground-secondary mb-4">
            Your next renewal is on October 12, 2024<br />
            <span className="text-foreground-secondary/70">$29.00 billed monthly</span>
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => subscribe('manage')}
            >
              Manage Billing
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground-secondary hover:text-foreground hover:bg-muted rounded-lg"
            >
              Cancel Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Available plans */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Available Plans</p>
        <div className="space-y-3">
          {PLANS.map((plan) => {
            const isActive = currentPlanKey === plan.key;
            return (
              <div
                key={plan.key}
                className={cn(
                  'relative bg-card border rounded-xl p-5 transition-all',
                  isActive
                    ? 'border-primary ring-1 ring-primary/50'
                    : 'border-border hover:border-border/80',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground-secondary">{plan.name}</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${(plan.price / 100).toFixed(0)}
                      <span className="text-sm font-normal text-foreground-secondary">/mo</span>
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-foreground-secondary/40 shrink-0" />
                      )}
                      <span className={f.included ? 'text-foreground' : 'text-foreground-secondary/50 line-through'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {isActive ? (
                  <Button
                    disabled
                    className="w-full bg-primary/20 text-primary border border-primary/30 rounded-lg font-medium cursor-default"
                  >
                    Active
                  </Button>
                ) : plan.price === 0 ? (
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground-secondary hover:text-foreground hover:bg-muted rounded-lg"
                    onClick={() => subscribe(plan.key)}
                    disabled={checkoutLoading === plan.key}
                  >
                    {checkoutLoading === plan.key ? 'Redirection…' : 'Downgrade'}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
                    onClick={() => subscribe(plan.key)}
                    disabled={checkoutLoading === plan.key}
                  >
                    {checkoutLoading === plan.key ? 'Redirection…' : 'Upgrade'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Billing History</p>
          <button className="text-xs text-primary hover:underline font-medium">
            Download All
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2.5 border-b border-border">
            {['DATE', 'DESCRIPTION', 'AMOUNT', 'INV.'].map((h) => (
              <p key={h} className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">{h}</p>
            ))}
          </div>
          {BILLING_HISTORY.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
            >
              <p className="text-xs text-foreground-secondary">{row.date}</p>
              <p className="text-xs text-foreground col-span-1">{row.description}</p>
              <p className="text-xs font-semibold text-foreground">{row.amount}</p>
              <div className="flex justify-end">
                <button className="text-foreground-secondary/50 hover:text-primary transition-colors">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
