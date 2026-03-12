'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { Mission } from '@/lib/types';
import { StatusBadge } from '@/components/status-badge';
import { formatPrice } from '@/lib/types';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ListChecks, Clock, Radio, Euro } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

// Données mock pour les graphiques (MVP)
const missionsByStatusData = [
  { name: 'Draft', value: 12 },
  { name: 'Payées', value: 8 },
  { name: 'Assignées', value: 3 },
  { name: 'En cours', value: 5 },
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

const yAxisRevenueFormatter = (v: number): string => `${(v / 1000).toFixed(0)}k€`;

const TOOLTIP_STYLE = {
  background: '#1a122e',
  border: '1px solid #2d2442',
  borderRadius: '8px',
  fontSize: 12,
  color: '#fff',
};

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, trend, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-foreground-secondary">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-error'}`}>
              {trend >= 0
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />}
              {trend >= 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-foreground-secondary text-sm mt-1">Vue d&apos;ensemble de l&apos;activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total missions"
          value={missions.length}
          trend={12}
          icon={ListChecks}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <KpiCard
          label="En attente paiement"
          value={pendingPayment}
          trend={5}
          icon={Clock}
          iconBg="bg-warning/20"
          iconColor="text-warning"
        />
        <KpiCard
          label="Lives en cours"
          value={inProgress}
          trend={-2}
          icon={Radio}
          iconBg="bg-info/20"
          iconColor="text-info"
        />
        <KpiCard
          label="Chiffre d'affaires"
          value={formatPrice(totalRevenue)}
          trend={18}
          icon={Euro}
          iconBg="bg-success/20"
          iconColor="text-success"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 1 — Missions par statut */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-base font-semibold text-foreground mb-4">Missions par statut</h2>
          {mounted && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={missionsByStatusData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2442" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#2d2442' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: 'rgba(122,56,245,0.08)' }}
                />
                <Bar dataKey="value" fill="#7a38f5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart 2 — Revenus */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-base font-semibold text-foreground mb-4">Revenus des 6 derniers mois</h2>
          {mounted && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a38f5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7a38f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2442" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#2d2442' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={yAxisRevenueFormatter}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value as number ?? 0}€`, 'Revenus']}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  stroke="#7a38f5"
                  strokeWidth={2}
                  fill="url(#adminRevenusGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lives du jour */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Lives du jour ({todayMissions.length})
          </h2>
          <Link
            href="/admin/missions"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-foreground-secondary text-sm">Chargement…</div>
        ) : todayMissions.length === 0 ? (
          <div className="px-6 py-8 text-center text-foreground-secondary text-sm">
            Aucun live prévu aujourd&apos;hui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sidebar">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Heure</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Catégorie / Ville</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {todayMissions.map((m) => (
                <tr key={m.id} className="hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-secondary">
                    {m.startTime}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium capitalize text-foreground">{m.category}</p>
                    <p className="text-xs text-foreground-secondary">{m.city} · {m.durationHours}h</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/missions/${m.id}`}
                      className="border border-border rounded-lg text-xs px-2 py-1 hover:bg-primary-light text-foreground transition-colors"
                    >
                      Gérer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
