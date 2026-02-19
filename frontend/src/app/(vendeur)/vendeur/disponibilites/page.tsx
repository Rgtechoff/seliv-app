'use client';

import { useEffect, useState } from 'react';
import { availabilitiesApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface Availability {
  id: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  dateSpecific: string | null;
  isAvailable: boolean;
}

const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat

export default function DisponibilitesPage() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding recurring slot
  const [newDay, setNewDay] = useState<number>(1);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('18:00');

  // Form state for specific date override
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideStart, setOverrideStart] = useState('09:00');
  const [overrideEnd, setOverrideEnd] = useState('18:00');
  const [overrideAvailable, setOverrideAvailable] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    availabilitiesApi
      .getMy()
      .then((r) => setSlots((r.data.data as Availability[]) ?? []))
      .catch(() => toast({ title: 'Erreur', description: 'Impossible de charger les disponibilités', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const recurringSlots = slots.filter((s) => s.dayOfWeek !== null);
  const specificSlots = slots.filter((s) => s.dateSpecific !== null);

  async function addRecurring() {
    setSaving(true);
    try {
      const res = await availabilitiesApi.upsert({
        dayOfWeek: newDay,
        startTime: newStart,
        endTime: newEnd,
        isAvailable: true,
      });
      setSlots((prev) => [...prev, res.data.data as Availability]);
      toast({ title: 'Créneau ajouté' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter le créneau', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function addOverride() {
    if (!overrideDate) {
      toast({ title: 'Date requise', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await availabilitiesApi.upsert({
        dateSpecific: overrideDate,
        startTime: overrideAvailable ? overrideStart : null,
        endTime: overrideAvailable ? overrideEnd : null,
        isAvailable: overrideAvailable,
      });
      setSlots((prev) => [...prev, res.data.data as Availability]);
      toast({ title: overrideAvailable ? 'Date ajoutée' : 'Date bloquée' });
      setOverrideDate('');
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter la date', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(id: string) {
    try {
      await availabilitiesApi.remove(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Créneau supprimé' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Disponibilités</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos créneaux récurrents et vos exceptions par date.
        </p>
      </div>

      {/* Recurring schedule */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Créneaux récurrents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Per-day slots */}
            {WORKING_DAYS.map((day) => {
              const daySlots = recurringSlots.filter((s) => s.dayOfWeek === day);
              return (
                <div key={day} className="space-y-1">
                  <p className="text-sm font-medium">{DAY_LABELS[day]}</p>
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucun créneau</p>
                  ) : (
                    daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between bg-muted rounded px-3 py-1">
                        <span className="text-sm">
                          {slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => removeSlot(slot.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              );
            })}

            {/* Add recurring slot */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-1">
                <Plus className="h-4 w-4" /> Ajouter un créneau
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Jour</Label>
                  <select
                    className="w-full mt-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                  >
                    {WORKING_DAYS.map((d) => (
                      <option key={d} value={d}>{DAY_LABELS[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Début</Label>
                  <Input
                    type="time"
                    className="mt-1 text-sm"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Fin</Label>
                  <Input
                    type="time"
                    className="mt-1 text-sm"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
              </div>
              <Button size="sm" onClick={addRecurring} disabled={saving}>
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Date-specific overrides */}
        <Card>
          <CardHeader>
            <CardTitle>Exceptions par date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {specificSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune exception définie</p>
            ) : (
              specificSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-muted rounded px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {slot.dateSpecific
                        ? new Date(slot.dateSpecific).toLocaleDateString('fr-FR')
                        : ''}
                    </p>
                    {slot.isAvailable ? (
                      <p className="text-xs text-muted-foreground">
                        {slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}
                      </p>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Indisponible</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => removeSlot(slot.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}

            {/* Add override */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-1">
                <Plus className="h-4 w-4" /> Ajouter une exception
              </p>
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-sm"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="avail"
                  checked={overrideAvailable}
                  onChange={(e) => setOverrideAvailable(e.target.checked)}
                />
                <Label htmlFor="avail" className="text-sm">Disponible ce jour</Label>
              </div>
              {overrideAvailable && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Début</Label>
                    <Input
                      type="time"
                      className="mt-1 text-sm"
                      value={overrideStart}
                      onChange={(e) => setOverrideStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fin</Label>
                    <Input
                      type="time"
                      className="mt-1 text-sm"
                      value={overrideEnd}
                      onChange={(e) => setOverrideEnd(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <Button size="sm" onClick={addOverride} disabled={saving || !overrideDate}>
                {overrideAvailable ? 'Ajouter disponibilité' : 'Bloquer ce jour'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
