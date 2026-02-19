'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import type { Mission } from '@/lib/types';
import { StatusBadge } from '@/components/status-badge';
import { formatPrice } from '@/lib/types';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Données mock pour les graphiques (MVP)
const missionsByStatusData = [
  { name: 'Payées', value: 12 },
  { name: 'Assignées', value: 8 },
  { name: 'En cours', value: 3 },
  { name: 'Terminées', value: 45 },
  { name: 'Annulées', value: 5 },
];

const revenueData = [
  { month: 'Sep', revenus: 4200 },
  { month: 'Oct', revenus: 6800 },
  { month: 'Nov', revenus: 5400 },
  { month: 'Déc', revenus: 9200 },
  { month: 'Jan', revenus: 7600 },
  { month: 'Fév', revenus: 11400 },
];

const yAxisRevenueFormatter = (v: number): string => `${v}€`;

export default function AdminDashboardPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    adminApi.getMissions().then((res) => {
      setMissions((res.data.data as Mission[]) ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayMissions = missions.filter((m) => m.date === today);
  const pendingPayment = missions.filter((m) => m.status === 'pending_payment').length;
  const inProgress = missions.filter((m) => m.status === 'in_progress').length;
  const totalRevenue = missions
    .filter((m) => ['paid', 'assigned', 'in_progress', 'completed'].includes(m.status))
    .reduce((sum, m) => sum + m.totalPrice, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{missions.length}</p>
            <p className="text-sm text-muted-foreground">Total missions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{pendingPayment}</p>
            <p className="text-sm text-muted-foreground">En attente paiement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{inProgress}</p>
            <p className="text-sm text-muted-foreground">Lives en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">CA total</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Graphique 1 — Missions par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Missions par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={missionsByStatusData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Graphique 2 — Revenus des 6 derniers mois */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus des 6 derniers mois</CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={yAxisRevenueFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number | string | undefined) => [`${value ?? 0}€`, 'Revenus']} />
                  <Area
                    type="monotone"
                    dataKey="revenus"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#colorRevenus)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lives d'aujourd'hui */}
      <Card>
        <CardHeader>
          <CardTitle>Lives d&apos;aujourd&apos;hui ({todayMissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Chargement…</p>
          ) : todayMissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun live prévu aujourd&apos;hui.</p>
          ) : (
            <div className="space-y-2">
              {todayMissions.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{m.category} — {m.city}</p>
                    <p className="text-xs text-muted-foreground">{m.startTime} · {m.durationHours}h</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={m.status} />
                    <Link href={`/admin/missions?id=${m.id}`} className="text-xs text-primary hover:underline">
                      Gérer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
