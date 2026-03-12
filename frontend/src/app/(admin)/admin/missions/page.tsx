'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { formatPrice, type Mission } from '@/lib/types';
import { adminApi } from '@/lib/api';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Download, UserPlus } from 'lucide-react';

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filtered, setFiltered] = useState<Mission[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [vendeurId, setVendeurId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    adminApi.getMissions().then((res) => {
      const data = (res.data.data as Mission[]) ?? [];
      setMissions(data);
      setFiltered(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      missions.filter(
        (m) =>
          m.city.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.status.includes(q),
      ),
    );
  }, [search, missions]);

  const handleAssign = async () => {
    if (!selectedMission || !vendeurId.trim()) return;
    setAssigning(true);
    try {
      await adminApi.assignVendeur(selectedMission.id, vendeurId.trim());
      const updated = await adminApi.getMissions();
      const data = (updated.data.data as Mission[]) ?? [];
      setMissions(data);
      setFiltered(data);
      setAssignOpen(false);
    } finally {
      setAssigning(false);
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Missions ({missions.length})</h1>
          <p className="text-foreground-secondary text-sm mt-1">Gérez toutes les missions de la plateforme</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-primary-light transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
        <input
          placeholder="Rechercher par ville, catégorie, statut…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sidebar">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Ville</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Prix</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-foreground-secondary">
                    Chargement…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-foreground-secondary">
                    Aucune mission trouvée.
                  </td>
                </tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="border-b border-border hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3 text-foreground-secondary">
                    {format(new Date(m.date), 'dd/MM/yy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 text-foreground">{m.city}</td>
                  <td className="px-4 py-3 capitalize text-foreground">{m.category}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatPrice(m.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {m.status === 'paid' && (
                        <button
                          onClick={() => { setSelectedMission(m); setAssignOpen(true); }}
                          className="flex items-center gap-1.5 border border-border rounded-lg px-2 py-1 text-xs text-foreground hover:bg-primary-light transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          Assigner
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 border-t border-border text-xs text-foreground-secondary">
            {filtered.length} / {missions.length} missions
          </div>
        )}
      </div>

      {/* Modal assign vendeur */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="bg-card border border-border rounded-xl shadow-modal">
          <DialogHeader>
            <DialogTitle className="text-foreground">Assigner un vendeur</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label className="text-sm text-foreground-secondary">ID du vendeur</Label>
            <input
              value={vendeurId}
              onChange={(e) => setVendeurId(e.target.value)}
              placeholder="UUID du vendeur"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-primary font-mono"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setAssignOpen(false)}
              className="border border-border bg-transparent hover:bg-primary-light text-foreground rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Annuler
            </button>
            <Button
              disabled={assigning || !vendeurId.trim()}
              onClick={handleAssign}
              className="bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg"
            >
              {assigning ? 'Assignation…' : 'Assigner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
