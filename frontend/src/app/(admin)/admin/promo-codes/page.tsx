'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type DiscountType = 'percent' | 'fixed' | 'free';

interface PromoCode {
  id: string;
  code: string;
  label: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}


function discountLabel(code: PromoCode): string {
  if (code.discountType === 'free') return 'Gratuit (100%)';
  if (code.discountType === 'percent') return `-${code.discountValue}%`;
  return `-${formatPrice(code.discountValue)}`;
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: '',
    label: '',
    discountType: 'percent' as DiscountType,
    discountValue: '',
    maxUses: '',
    expiresAt: '',
  });

  const load = async () => {
    try {
      const res = await adminApi.getPromoCodes();
      setCodes((res.data as { data: PromoCode[] }).data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleCreate = async () => {
    if (!form.code) return;
    if (form.discountType !== 'free' && !form.discountValue) return;
    setSaving(true);
    try {
      const discountValue = form.discountType === 'free'
        ? 0
        : form.discountType === 'fixed'
          ? Math.round(parseFloat(form.discountValue) * 100)
          : parseInt(form.discountValue, 10);
      const res = await adminApi.createPromoCode({
        code: form.code,
        label: form.label || undefined,
        discountType: form.discountType,
        discountValue,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setCodes((prev) => [(res.data as { data: PromoCode }).data, ...prev]);
      setForm({ code: '', label: '', discountType: 'percent', discountValue: '', maxUses: '', expiresAt: '' });
      setShowForm(false);
      toast({ title: 'Code promo créé', variant: 'default' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: err?.response?.data?.message ?? 'Erreur lors de la création', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (code: PromoCode) => {
    try {
      const res = await adminApi.updatePromoCode(code.id, { isActive: !code.isActive });
      const updated = (res.data as { data: PromoCode }).data;
      setCodes((prev) => prev.map((c) => (c.id === code.id ? updated : c)));
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    try {
      await adminApi.deletePromoCode(id);
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Code supprimé', variant: 'default' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Codes Promo</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Créez et gérez les codes de réduction pour vos clients.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary hover:bg-primary/90 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau code
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-card border border-primary/30">
          <CardContent className="pt-5 space-y-4">
            <h2 className="font-semibold text-foreground">Créer un code promo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  placeholder="ESSAI2024"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label (facultatif)</Label>
                <Input
                  placeholder="Mission d'essai"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type de réduction *</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => setForm((f) => ({ ...f, discountType: v as DiscountType, discountValue: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">% Réduction</SelectItem>
                    <SelectItem value="fixed">€ Fixe (centimes → €)</SelectItem>
                    <SelectItem value="free">Gratuit (0€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.discountType !== 'free' && (
                <div className="space-y-1.5">
                  <Label>{form.discountType === 'percent' ? 'Pourcentage (0-100) *' : 'Montant en € *'}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={form.discountType === 'percent' ? 100 : undefined}
                    step={form.discountType === 'fixed' ? 0.01 : 1}
                    placeholder={form.discountType === 'percent' ? '10' : '29.00'}
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Limite d&apos;utilisations (vide = illimitée)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="100"
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date d&apos;expiration (facultatif)</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
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

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : codes.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">Aucun code promo.</p>
      ) : (
        <div className="space-y-2">
          {codes.map((code) => (
            <Card key={code.id} className={`bg-card border ${code.isActive ? 'border-border' : 'border-border opacity-60'}`}>
              <CardContent className="py-3 px-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-foreground text-sm">{code.code}</span>
                    {code.label && <span className="text-xs text-foreground-secondary">{code.label}</span>}
                    <Badge className={code.isActive ? 'bg-success/15 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                      {code.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-foreground-secondary flex-wrap">
                    <span className="font-semibold text-primary">{discountLabel(code)}</span>
                    <span>{code.usedCount} / {code.maxUses ?? '∞'} utilisations</span>
                    {code.expiresAt && (
                      <span>Expire le {format(new Date(code.expiresAt), 'd MMM yyyy', { locale: fr })}</span>
                    )}
                    <span>Créé le {format(new Date(code.createdAt), 'd MMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleToggle(code)}
                    title={code.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {code.isActive
                      ? <ToggleRight className="h-5 w-5 text-primary" />
                      : <ToggleLeft className="h-5 w-5 text-foreground-secondary" />
                    }
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(code.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
