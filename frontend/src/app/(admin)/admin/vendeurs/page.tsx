'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import type { User } from '@/lib/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Vendeurs ({vendeurs.length})</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Zones</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscrit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Chargement…</TableCell>
                </TableRow>
              ) : vendeurs.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.firstName} {v.lastName}
                    {v.isStar && ' ⭐'}
                  </TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.zones?.join(', ') ?? '—'}</TableCell>
                  <TableCell className="capitalize">{v.level ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={v.isValidated ? 'success' : 'secondary'}>
                      {v.isValidated ? 'Validé' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(v.createdAt), 'dd/MM/yy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!v.isValidated && (
                        <Button size="sm" variant="outline" onClick={() => validate(v.id)}>
                          Valider
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => toggleStar(v.id)}>
                        {v.isStar ? '★ Retirer' : '☆ Star'}
                      </Button>
                    </div>
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
