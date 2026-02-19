'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { formatPrice, type Mission } from '@/lib/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Facturation</h1>
        <Button variant="outline" onClick={exportCSV}>Exporter CSV</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">CA total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{formatPrice(totalRefunds)}</p>
            <p className="text-sm text-muted-foreground">Remboursements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date paiement</TableHead>
                <TableHead>Date live</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Chargement…</TableCell>
                </TableRow>
              ) : missions.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {m.paidAt ? format(new Date(m.paidAt), 'dd/MM/yy', { locale: fr }) : '—'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(m.date), 'dd/MM/yy', { locale: fr })}
                  </TableCell>
                  <TableCell>{m.city}</TableCell>
                  <TableCell className="capitalize">{m.category}</TableCell>
                  <TableCell className="font-medium">{formatPrice(m.totalPrice)}</TableCell>
                  <TableCell>
                    <span className={m.status === 'cancelled' ? 'text-destructive' : 'text-green-600'}>
                      {m.status === 'cancelled' ? 'Remboursé' : 'Payé'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
