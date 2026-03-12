'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatPrice, type Mission } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, TrendingUp, RotateCcw } from 'lucide-react';

export default function AdminFacturationPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getMissions().then((res) => {
      const data = ((res.data.data as Mission[]) ?? []).filter(
        (m) => m.paidAt != null,
      );
      setMissions(data);
    }).finally(() => setLoading(false));
  }, []);

  const totalRevenue = missions.reduce((s, m) => s + m.totalPrice, 0);
  const totalRefunds = missions
    .filter((m) => m.status === 'cancelled')
    .reduce((s, m) => s + m.totalPrice, 0);

  const exportCSV = async () => {
    const res = await adminApi.exportMissions();
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'missions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Facturation</h1>
          <p className="text-foreground-secondary text-sm mt-1">Suivi des transactions et remboursements</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-primary-light transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">CA total</p>
              <p className="text-3xl font-bold text-foreground mt-2">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">Remboursements</p>
              <p className="text-3xl font-bold text-error mt-2">{formatPrice(totalRefunds)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-error" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sidebar">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Date paiement</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Date live</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Ville</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-foreground-secondary">Chargement…</td>
                </tr>
              ) : missions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-foreground-secondary">Aucune transaction.</td>
                </tr>
              ) : missions.map((m) => (
                <tr key={m.id} className="border-b border-border hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3 text-foreground-secondary">
                    {m.paidAt ? format(new Date(m.paidAt), 'dd/MM/yy', { locale: fr }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {format(new Date(m.date), 'dd/MM/yy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 text-foreground">{m.city}</td>
                  <td className="px-4 py-3 capitalize text-foreground">{m.category}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${m.status === 'cancelled' ? 'text-error' : 'text-success'}`}>
                      {formatPrice(m.totalPrice)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.status === 'cancelled' ? (
                      <span className="bg-error/20 text-error border border-error/30 rounded text-xs px-2 py-0.5">
                        Remboursé
                      </span>
                    ) : (
                      <span className="bg-success/20 text-success border border-success/30 rounded text-xs px-2 py-0.5">
                        Payé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 border-t border-border text-xs text-foreground-secondary">
            {missions.length} transactions
          </div>
        )}
      </div>
    </div>
  );
}
