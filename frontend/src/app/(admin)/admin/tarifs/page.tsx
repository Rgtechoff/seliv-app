'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Loader2, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';

interface PricingConfig {
  id: string;
  key: string;
  label: string;
  category: 'hourly_rate' | 'option';
  valueCentimes: number;
  updatedAt: string;
}

function EditableRow({
  config,
  onSave,
  onDelete,
}: {
  config: PricingConfig;
  onSave: (key: string, value: number) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState((config.valueCentimes / 100).toFixed(2));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const cents = Math.round(parseFloat(inputVal) * 100);
    if (isNaN(cents) || cents < 0) return;
    setLoading(true);
    await onSave(config.key, cents);
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{config.label}</p>
        <p className="text-xs text-foreground-secondary font-mono">{config.key}</p>
      </div>
      <div className="flex items-center gap-1 ml-4">
        {editing ? (
          <>
            <div className="relative w-28">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="pr-6 h-8 text-sm"
                autoFocus
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground-secondary">€</span>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setEditing(false); setInputVal((config.valueCentimes / 100).toFixed(2)); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-foreground w-20 text-right">{formatPrice(config.valueCentimes)}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(config.key)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminTarifsPage() {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    key: '',
    label: '',
    category: 'option' as 'hourly_rate' | 'option',
    valueCentimes: '',
  });

  const load = async () => {
    try {
      const res = await adminApi.getPricing();
      setConfigs((res.data as { data: PricingConfig[] }).data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleSave = async (key: string, valueCentimes: number) => {
    try {
      const res = await adminApi.updatePricing(key, valueCentimes);
      const updated = (res.data as { data: PricingConfig }).data;
      setConfigs((prev) => prev.map((c) => (c.key === key ? updated : c)));
      toast({ title: 'Tarif mis à jour', variant: 'default' });
    } catch {
      toast({ title: 'Erreur lors de la mise à jour', variant: 'destructive' });
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Supprimer le tarif "${key}" ?`)) return;
    try {
      await adminApi.deletePricing(key);
      setConfigs((prev) => prev.filter((c) => c.key !== key));
      toast({ title: 'Tarif supprimé', variant: 'default' });
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!form.key || !form.label || !form.valueCentimes) return;
    setSaving(true);
    try {
      const res = await adminApi.createPricing({
        key: form.key.toLowerCase().replace(/\s+/g, '_'),
        label: form.label,
        category: form.category,
        valueCentimes: Math.round(parseFloat(form.valueCentimes) * 100),
      });
      const created = (res.data as { data: PricingConfig }).data;
      setConfigs((prev) => [...prev, created]);
      setForm({ key: '', label: '', category: 'option', valueCentimes: '' });
      setShowForm(false);
      toast({ title: 'Tarif créé', variant: 'default' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: err?.response?.data?.message ?? 'Erreur lors de la création', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hourlyRates = configs.filter((c) => c.category === 'hourly_rate');
  const options = configs.filter((c) => c.category === 'option');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Tarifs</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Modifiez les tarifs horaires et les prix des options.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Nouveau tarif
        </Button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <Card className="bg-card border border-primary/30">
          <CardContent className="pt-5 space-y-4">
            <h2 className="font-semibold text-foreground">Créer un nouveau tarif</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Clé (identifiant unique) *</Label>
                <Input
                  placeholder="mission_essai"
                  value={form.key}
                  onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label affiché *</Label>
                <Input
                  placeholder="Mission d'essai"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as 'hourly_rate' | 'option' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly_rate">Tarif horaire</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prix en € * (0 = gratuit)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.valueCentimes}
                  onChange={(e) => setForm((f) => ({ ...f, valueCentimes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-primary hover:bg-primary/90 text-white gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Créer
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Tarifs horaires
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">par heure</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hourlyRates.length === 0
                ? <p className="text-sm text-foreground-secondary py-4 text-center">Aucun tarif horaire.</p>
                : hourlyRates.map((c) => (
                  <EditableRow key={c.key} config={c} onSave={handleSave} onDelete={handleDelete} />
                ))
              }
            </CardContent>
          </Card>

          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Prix des Options</CardTitle>
            </CardHeader>
            <CardContent>
              {options.length === 0
                ? <p className="text-sm text-foreground-secondary py-4 text-center">Aucune option.</p>
                : options.map((c) => (
                  <EditableRow key={c.key} config={c} onSave={handleSave} onDelete={handleDelete} />
                ))
              }
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
