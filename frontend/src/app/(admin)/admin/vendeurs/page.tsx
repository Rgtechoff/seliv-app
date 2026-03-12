'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star } from 'lucide-react';

export default function AdminVendeursPage() {
  const [vendeurs, setVendeurs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi.getVendeurs().then((res) => {
      setVendeurs((res.data.data as User[]) ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const validate = async (id: string) => {
    await adminApi.validateVendeur(id);
    load();
  };

  const toggleStar = async (id: string) => {
    await adminApi.toggleStar(id);
    load();
  };

  function getLevelBadge(level: string | null | undefined) {
    if (!level) return null;
    const map: Record<string, string> = {
      debutant: 'bg-muted text-foreground-secondary border border-border',
      confirme: 'bg-info/20 text-info border border-info/30',
      expert: 'bg-accent/20 text-accent border border-accent/30',
      star: 'bg-gradient-to-r from-primary to-accent text-white border-0',
    };
    const cls = map[level] ?? 'bg-muted text-foreground-secondary border border-border';
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendeurs ({vendeurs.length})</h1>
        <p className="text-foreground-secondary text-sm mt-1">Gérez et validez les vendeurs de la plateforme</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sidebar">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Vendeur</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Zones</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Niveau</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Inscrit</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-8 text-foreground-secondary">Chargement…</td>
                </tr>
              ) : vendeurs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-8 text-foreground-secondary">Aucun vendeur.</td>
                </tr>
              ) : vendeurs.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-8 h-8 bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {v.firstName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {v.firstName} {v.lastName}
                          {v.isStar && (
                            <Star className="inline w-3.5 h-3.5 text-amber-400 fill-amber-400 ml-1 mb-0.5" />
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">{v.email}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{v.zones?.join(', ') ?? '—'}</td>
                  <td className="px-4 py-3">
                    {getLevelBadge(v.level) ?? <span className="text-foreground-secondary">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {v.isValidated ? (
                      <span className="bg-success/20 text-success border border-success/30 rounded text-xs px-2 py-0.5">
                        Validé
                      </span>
                    ) : (
                      <span className="bg-warning/20 text-warning border border-warning/30 rounded text-xs px-2 py-0.5">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {format(new Date(v.createdAt), 'dd/MM/yy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!v.isValidated && (
                        <button
                          onClick={() => validate(v.id)}
                          className="bg-success/20 text-success border border-success/30 rounded-lg text-xs px-2 py-1 hover:bg-success/30 transition-colors"
                        >
                          Valider
                        </button>
                      )}
                      <button
                        onClick={() => toggleStar(v.id)}
                        className="bg-accent/20 text-accent border border-accent/30 rounded-lg text-xs px-2 py-1 hover:bg-accent/30 transition-colors"
                      >
                        {v.isStar ? '★ Retirer' : '☆ Star'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
