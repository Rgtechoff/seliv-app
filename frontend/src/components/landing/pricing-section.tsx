'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  popular: boolean;
}

const PLANS: PricingPlan[] = [
  {
    name: 'Basic',
    price: '29€',
    period: '/mois',
    description: 'Pour commencer avec le live shopping',
    features: [
      { text: '5% de remise horaire' },
      { text: '1 live par semaine' },
      { text: 'Support par email' },
      { text: 'Accès aux vendeurs confirmés' },
    ],
    ctaLabel: 'Commencer',
    popular: false,
  },
  {
    name: 'Pro',
    price: '79€',
    period: '/mois',
    description: 'Pour les marques qui veulent scaler',
    features: [
      { text: '15% de remise horaire' },
      { text: 'Lives illimités' },
      { text: 'Accès vendeurs Star' },
      { text: 'Support prioritaire 7j/7' },
    ],
    ctaLabel: 'Commencer',
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Des tarifs transparents
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos ambitions. Sans engagement, sans surprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.12, ease: 'easeOut' }}
            >
            <Card
              className={
                plan.popular
                  ? 'bg-card border-2 border-primary shadow-modal relative rounded-xl'
                  : 'bg-card border-2 border-border shadow-card rounded-xl'
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white hover:bg-primary border-0 px-4 py-1 text-sm">
                    Populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-8 pb-4 px-6">
                <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-foreground-secondary mt-1">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-foreground-secondary text-lg">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? 'text-primary' : 'text-success'
                        }`}
                      />
                      <span className="text-sm text-foreground-secondary">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'border-border text-foreground hover:bg-primary/10 hover:border-primary/50'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">{plan.ctaLabel}</Link>
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
