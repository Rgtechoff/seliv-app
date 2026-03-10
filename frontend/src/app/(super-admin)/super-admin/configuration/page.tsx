'use client';

import * as React from 'react';
import { Settings, Clock, Percent, Mail, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';

interface ConfigSection {
  title: string;
  description: string;
  icon: React.ElementType;
  items: { label: string; value: string; note?: string }[];
}

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    title: 'Politique d\u2019annulation',
    description: 'R\u00e8gles de remboursement selon le d\u00e9lai d\u2019annulation',
    icon: Clock,
    items: [
      { label: 'Annulation \u226548h avant le live', value: 'Remboursement 100%', note: 'La totalit\u00e9 du montant est rembours\u00e9e' },
      { label: 'Annulation <48h avant le live', value: 'Remboursement 50%', note: 'La moiti\u00e9 du montant est rembours\u00e9e' },
      { label: 'Annulation en cours de live', value: 'Impossible', note: 'Le remboursement est bloqu\u00e9' },
    ],
  },
  {
    title: 'Commission & Tarification',
    description: 'Param\u00e8tres de calcul des prix et commissions',
    icon: Percent,
    items: [
      { label: 'Stockage des prix', value: 'Centimes (integer)', note: 'Conversion en euros c\u00f4t\u00e9 frontend' },
      { label: 'Devise', value: 'EUR (\u20ac)', note: 'Seule devise support\u00e9e' },
      { label: 'Paiement', value: 'Complet \u00e0 la commande', note: 'Pas d\u2019acompte — paiement int\u00e9gral via Stripe' },
    ],
  },
  {
    title: 'Acc\u00e8s & R\u00f4les',
    description: 'Niveaux d\u2019acc\u00e8s et restrictions par r\u00f4le',
    icon: Shield,
    items: [
      { label: 'Vendeur Star', value: 'Abonn\u00e9s Pro uniquement', note: 'Acc\u00e8s r\u00e9serv\u00e9 aux clients avec abonnement Pro' },
      { label: 'Donn\u00e9es client', value: 'Prot\u00e9g\u00e9es', note: 'T\u00e9l\u00e9phone & email du client jamais expos\u00e9s au vendeur' },
      { label: 'R\u00f4les disponibles', value: 'client, vendeur, mod\u00e9rateur, admin, super_admin', note: 'Hiers archiqu cr\u00e9ant d\u2019acc\u00e8s progressifs' },
    ],
  },
  {
    title: 'Notifications & Emails',
    description: 'Fournisseurs de services de communication',
    icon: Mail,
    items: [
      { label: 'Service email', value: 'Resend', note: 'API transactionnelle — configurer RESEND_API_KEY' },
      { label: 'WebSocket', value: 'Socket.io (NestJS Gateway)', note: 'Notifications temps r\u00e9el dans le chat et le tableau de bord' },
      { label: 'Email exp\u00e9diteur', value: 'noreply@seliv.fr', note: 'Configurable via RESEND_FROM_EMAIL' },
    ],
  },
  {
    title: 'Cycle de vie des missions',
    description: 'Machine d\u2019\u00e9tats et transitions autoris\u00e9es',
    icon: Settings,
    items: [
      { label: '\u00c9tat initial', value: 'draft', note: 'Cr\u00e9\u00e9 par le client, pas encore pay\u00e9' },
      { label: 'Apr\u00e8s paiement', value: 'paid', note: 'En attente d\u2019assignation d\u2019un vendeur' },
      { label: 'Flux complet', value: 'draft \u2192 pending_payment \u2192 paid \u2192 assigned \u2192 in_progress \u2192 completed | cancelled', note: 'Transitions contr\u00f4l\u00e9es par le backend' },
    ],
  },
];

function ConfigCard({ section }: { section: ConfigSection }) {
  const Icon = section.icon;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{section.title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{section.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {section.items.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                {item.note && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                )}
              </div>
              <span className="text-sm font-mono bg-muted/50 px-2 py-0.5 rounded text-right shrink-0 max-w-[50%]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminConfigurationPage() {
  return (
    <div>
      <PageHeader
        title="Configuration"
        description="Param\u00e8tres syst\u00e8me et r\u00e8gles m\u00e9tier de la plateforme SELIV"
      />

      <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm text-blue-800 dark:text-blue-300">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Ces param\u00e8tres repr\u00e9sentent les r\u00e8gles m\u00e9tier actuellement cod\u00e9es dans le syst\u00e8me.
          Toute modification n\u00e9cessite une intervention technique sur le backend.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {CONFIG_SECTIONS.map((section) => (
          <ConfigCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
