'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Calendar,
  CheckCircle,
  Users,
  UserPlus,
  CreditCard,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { apiClient } from '@/lib/api';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { SkeletonCard } from '@/components/shared/skeleton';
import { formatPrice } from '@/lib/types';

interface DashboardData {
  revenueThisMonth: number;
  revenueGrowthPercent: number;
  missionsThisMonth: number;
  completionRate: number;
  totalClients: number;
  totalVendeurs: number;
  activeSubscriptions: number;
  topVendeurs: Array<{ id: string; firstName: string; lastName: string; level: string | null; totalRevenue: number; avatarUrl: string | null }>;
  topClients: Array<{ id: string; firstName: string; lastName: string; company: string | null; ltv: number; missionsTotal: number }>;
}

interface ChartPoint {
  month: string;
  revenue?: number;
  completed?: number;
  cancelled?: number;
  total?: number;
}

interface ActivityEntry {
  id: string;
  action: string;
  actorId: string | null;
  actorRole: string | null;
  targetType: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  plan_created: 'Plan créé',
  plan_updated: 'Plan modifié',
  plan_deleted: 'Plan supprimé',
  service_created: 'Service créé',
  service_updated: 'Service modifié',
  user_suspended: 'Utilisateur suspendu',
  user_unsuspended: 'Suspension levée',
  mission_created: 'Mission créée',
  mission_updated: 'Mission mise à jour',
};

function KpiCard({
  title, value, trend, icon: Icon, format: fmt, color = 'indigo',
}: {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  format?: (n: number) => string;
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'orange';
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1 text-foreground">
          <AnimatedCounter value={value} format={fmt} />
        </p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}% vs mois dernier
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="font-semibold text-foreground mb-4">Revenus 12 derniers mois</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v: number) => `${(v / 100).toFixed(0)}€`}
          />
          <Tooltip
            formatter={(v) => [formatPrice(v as number), 'Revenus']}
            labelFormatter={(l) => `Mois: ${String(l)}`}
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenus"
            stroke="hsl(239 84% 67%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MissionsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="font-semibold text-foreground mb-4">Missions 12 derniers mois</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="completed" name="Terminées" fill="hsl(142 71% 45%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="cancelled" name="Annulées" fill="hsl(0 72% 51%)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [revenueChart, setRevenueChart] = React.useState<ChartPoint[]>([]);
  const [missionsChart, setMissionsChart] = React.useState<ChartPoint[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<ActivityEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      apiClient.get('/super-admin/analytics'),
      apiClient.get('/super-admin/analytics/revenue-chart'),
      apiClient.get('/super-admin/analytics/missions-chart'),
      apiClient.get('/super-admin/activity-log?limit=5'),
    ]).then(([analytics, revenue, missions, activity]) => {
      setData(analytics.data as DashboardData);
      setRevenueChart(revenue.data as ChartPoint[]);
      setMissionsChart(missions.data as ChartPoint[]);
      const activityData = activity.data as { data: ActivityEntry[] };
      setRecentActivity(activityData.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard Super Admin</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Super Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d&apos;ensemble de la plateforme SELIV</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Revenus du mois"
          value={data.revenueThisMonth}
          trend={data.revenueGrowthPercent}
          icon={Euro}
          format={(n) => formatPrice(n)}
          color="indigo"
        />
        <KpiCard title="Missions ce mois" value={data.missionsThisMonth} icon={Calendar} color="blue" />
        <KpiCard title="Taux de complétion" value={data.completionRate} icon={CheckCircle} format={(n) => `${n}%`} color="green" />
        <KpiCard title="Clients total" value={data.totalClients} icon={Users} color="purple" />
        <KpiCard title="Vendeurs total" value={data.totalVendeurs} icon={UserPlus} color="orange" />
        <KpiCard title="Abonnements actifs" value={data.activeSubscriptions} icon={CreditCard} color="indigo" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueChart} />
        <MissionsChart data={missionsChart} />
      </div>

      {/* Top + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top vendeurs */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Top 5 Vendeurs</h2>
          <div className="space-y-3">
            {data.topVendeurs.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {v.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.firstName} {v.lastName}</p>
                  <p className="text-xs text-muted-foreground">{v.level ?? 'débutant'}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(v.totalRevenue)}</span>
              </div>
            ))}
            {data.topVendeurs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun vendeur</p>}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Top 5 Clients (LTV)</h2>
          <div className="space-y-3">
            {data.topClients.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary-foreground text-xs font-bold flex-shrink-0">
                  {c.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-muted-foreground">{c.company ?? `${c.missionsTotal} missions`}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(c.ltv)}</span>
              </div>
            ))}
            {data.topClients.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun client</p>}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Activité récente</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune activité</p>
            )}
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground">
                    {ACTION_LABELS[entry.action] ?? entry.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
