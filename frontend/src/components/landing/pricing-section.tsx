import Link from 'next/link';
import { Check } from 'lucide-react';
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
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Des tarifs transparents
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos ambitions. Sans engagement, sans surprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? 'border-2 border-indigo-600 shadow-xl relative'
                  : 'border-2 border-gray-200 shadow-sm'
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 border-0 px-4 py-1 text-sm">
                    Populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-8 pb-4 px-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="text-gray-500 mt-1">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-lg">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? 'text-indigo-600' : 'text-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">{plan.ctaLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
