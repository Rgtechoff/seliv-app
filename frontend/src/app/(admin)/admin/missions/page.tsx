'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/status-badge';
import { formatPrice, type Mission } from '@/lib/types';
import { adminApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Missions ({missions.length})</h1>
        <Button variant="outline" onClick={exportCSV}>
          Exporter CSV
        </Button>
      </div>

      <Input
        placeholder="Rechercher par ville, catégorie, statut…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {format(new Date(m.date), 'dd/MM/yy', { locale: fr })}
                  </TableCell>
                  <TableCell>{m.city}</TableCell>
                  <TableCell className="capitalize">{m.category}</TableCell>
                  <TableCell>{formatPrice(m.totalPrice)}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell>
                    {m.status === 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedMission(m); setAssignOpen(true); }}
                      >
                        Assigner
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un vendeur</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label>ID du vendeur</Label>
            <Input
              value={vendeurId}
              onChange={(e) => setVendeurId(e.target.value)}
              placeholder="UUID du vendeur"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Annuler</Button>
            <Button disabled={assigning || !vendeurId.trim()} onClick={handleAssign}>
              {assigning ? 'Assignation…' : 'Assigner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
