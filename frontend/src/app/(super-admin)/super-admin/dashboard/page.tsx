'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Calendar,
  CreditCard,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Settings,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { apiClient } from '@/lib/api';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { SkeletonCard } from '@/components/shared/skeleton';
import { formatPrice } from '@/lib/types';
import Link from 'next/link';

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

const ACTIVITY_COLORS: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  plan_created: { bg: 'bg-success/20 text-success border border-success/30', label: 'SUCCESS', icon: CheckCircle },
  plan_updated: { bg: 'bg-info/20 text-info border border-info/30', label: 'PLAN', icon: CreditCard },
  service_created: { bg: 'bg-success/20 text-success border border-success/30', label: 'SUCCESS', icon: CheckCircle },
  user_suspended: { bg: 'bg-warning/20 text-warning border border-warning/30', label: 'ALERTE', icon: AlertCircle },
  mission_created: { bg: 'bg-primary/10 text-primary border border-primary/30', label: 'MISSION', icon: Calendar },
};

const TOOLTIP_DARK = {
  background: '#1a122e',
  border: '1px solid #2d2442',
  borderRadius: '8px',
  fontSize: 12,
  color: '#fff',
};

interface KpiCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  format?: (n: number) => string;
}

function KpiCard({ title, value, trend, icon: Icon, iconBg, iconColor, format: fmt }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            <AnimatedCounter value={value} format={fmt} />
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-error'}`}>
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend >= 0 ? '+' : ''}{Math.abs(trend)}%
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

function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h2 className="text-base font-semibold text-foreground mb-4">Aperçu des Revenus</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="saRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7a38f5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7a38f5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2442" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: string) => v.slice(5)}
            axisLine={{ stroke: '#2d2442' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: number) => `${(v / 100).toFixed(0)}€`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [formatPrice(v as number), 'Revenus']}
            labelFormatter={(l) => `Mois: ${String(l)}`}
            contentStyle={TOOLTIP_DARK}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenus"
            stroke="#7a38f5"
            strokeWidth={2}
            fill="url(#saRevenueGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#7a38f5' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MissionsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h2 className="text-base font-semibold text-foreground mb-4">Missions par mois</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2442" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: string) => v.slice(5)}
            axisLine={{ stroke: '#2d2442' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_DARK} />
          <Bar dataKey="completed" name="Terminées" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="cancelled" name="Annulées" fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function getActivityConfig(action: string) {
  return ACTIVITY_COLORS[action] ?? {
    bg: 'bg-muted text-foreground-secondary border border-border',
    label: 'SYSTEM',
    icon: Settings,
  };
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Super Admin</h1>
          <p className="text-foreground-secondary text-sm mt-1">Vue d&apos;ensemble de la plateforme</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Super Admin</h1>
        <p className="text-foreground-secondary text-sm mt-1">Vue d&apos;ensemble de la plateforme SELIV</p>
      </div>

      {/* KPI Grid 4 colonnes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={data.totalClients + data.totalVendeurs}
          trend={12}
          icon={UserPlus}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <KpiCard
          title="Missions"
          value={data.missionsThisMonth}
          trend={8}
          icon={Calendar}
          iconBg="bg-info/20"
          iconColor="text-info"
        />
        <KpiCard
          title="Revenue"
          value={data.revenueThisMonth}
          trend={data.revenueGrowthPercent}
          icon={Euro}
          iconBg="bg-success/20"
          iconColor="text-success"
          format={(n) => formatPrice(n)}
        />
        <KpiCard
          title="Active Subs"
          value={data.activeSubscriptions}
          trend={-2}
          icon={CreditCard}
          iconBg="bg-accent/20"
          iconColor="text-accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueChart} />
        <MissionsChart data={missionsChart} />
      </div>

      {/* Dernières activités */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Dernières Activités</h2>
          <Link href="/super-admin/activity-log" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.length === 0 && (
            <div className="px-6 py-8 text-center text-foreground-secondary text-sm">Aucune activité</div>
          )}
          {recentActivity.map((entry) => {
            const config = getActivityConfig(entry.action);
            const Icon = config.icon;
            return (
              <div key={entry.id} className="flex items-center gap-4 px-6 py-3 hover:bg-primary-light/30 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg.split(' ').slice(0, 2).join(' ')}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {ACTION_LABELS[entry.action] ?? entry.action.replace(/_/g, ' ')}
                    {entry.actorId && (
                      <span className="text-primary"> : {entry.actorId.slice(0, 8)}</span>
                    )}
                  </p>
                  <p className="text-xs font-mono text-foreground-secondary">
                    {new Date(entry.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${config.bg}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top vendeurs */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-semibold text-foreground mb-4">Top 5 Vendeurs</h2>
          <div className="space-y-3">
            {data.topVendeurs.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground-secondary w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {v.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{v.firstName} {v.lastName}</p>
                  <p className="text-xs text-foreground-secondary">{v.level ?? 'débutant'}</p>
                </div>
                <span className="text-sm font-semibold text-success">{formatPrice(v.totalRevenue)}</span>
              </div>
            ))}
            {data.topVendeurs.length === 0 && <p className="text-sm text-foreground-secondary text-center py-4">Aucun vendeur</p>}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-semibold text-foreground mb-4">Top 5 Clients (LTV)</h2>
          <div className="space-y-3">
            {data.topClients.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground-secondary w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center text-info text-xs font-bold flex-shrink-0">
                  {c.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-foreground-secondary">{c.company ?? `${c.missionsTotal} missions`}</p>
                </div>
                <span className="text-sm font-semibold text-success">{formatPrice(c.ltv)}</span>
              </div>
            ))}
            {data.topClients.length === 0 && <p className="text-sm text-foreground-secondary text-center py-4">Aucun client</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
