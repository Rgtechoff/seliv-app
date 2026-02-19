'use client';

import { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PriceBreakdown } from '@/components/price-breakdown';
import { missionsApi, paymentsApi } from '@/lib/api';
import {
  CATEGORIES,
  VOLUMES,
  OPTIONS_CATALOG,
  formatPrice,
  type VolumeEnum,
} from '@/lib/types';

const schema = z.object({
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().min(1, 'Heure requise'),
  durationHoursStr: z.string().min(1, 'Durée requise'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  category: z.string().min(1, 'Catégorie requise'),
  volume: z.enum(['30', '50', '100', '200'] as const),
  options: z.array(z.string()).default([]),
});
type FormData = z.infer<typeof schema>;

const HOURLY_RATES: Record<VolumeEnum, number> = { '30': 8000, '50': 9000, '100': 11000, '200': 14000 };

export default function NewMissionPage() {
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as Resolver<FormData, any>,
    defaultValues: { volume: '50', options: [], durationHoursStr: '2' },
  });

  const volume = watch('volume') as VolumeEnum;
  const durationHoursStr = watch('durationHoursStr') ?? '2';
  const durationHours = parseInt(durationHoursStr, 10) || 2;
  const selectedOptions = watch('options') ?? [];

  const basePrice = (HOURLY_RATES[volume] ?? 9000) * durationHours;
  const optionsPrice = OPTIONS_CATALOG.filter((o) => selectedOptions.includes(o.key)).reduce(
    (s, o) => s + o.price,
    0,
  );
  const totalPrice = basePrice + optionsPrice;

  const toggleOption = (key: string) => {
    const curr = selectedOptions.includes(key)
      ? selectedOptions.filter((k) => k !== key)
      : [...selectedOptions, key];
    setValue('options', curr);
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await missionsApi.create({
        date: data.date,
        startTime: data.startTime,
        durationHours: parseInt(data.durationHoursStr, 10),
        address: data.address,
        city: data.city,
        category: data.category,
        volume: data.volume,
        options: data.options,
      });
      const mission = res.data.data as { id: string };
      const checkout = await paymentsApi.createCheckout(mission.id);
      const { url } = checkout.data.data as { url: string };
      window.location.href = url;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Erreur lors de la création');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle mission</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Détails du live</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Date du live</Label>
                  <Input type="date" {...register('date')} />
                  {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Heure de début</Label>
                  <Input type="time" {...register('startTime')} />
                  {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Durée (heures, min. 2)</Label>
                <Input type="number" min={2} {...register('durationHoursStr')} />
                {errors.durationHoursStr && <p className="text-xs text-destructive">{errors.durationHoursStr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Adresse</Label>
                <Input placeholder="15 rue de Rivoli" {...register('address')} />
                {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Ville</Label>
                <Input placeholder="Paris" {...register('city')} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Catégorie</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Volume d&apos;articles</Label>
                <Controller
                  control={control}
                  name="volume"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VOLUMES.map((v) => (
                          <SelectItem key={v.value} value={v.value}>
                            {v.label} — {v.rate}€/h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                Suivant : Options
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Options</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {OPTIONS_CATALOG.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(opt.key)}
                        onChange={() => toggleOption(opt.key)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(opt.price)}</span>
                  </label>
                ))}
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Récapitulatif</h3>
                <PriceBreakdown
                  basePrice={basePrice}
                  optionsPrice={optionsPrice}
                  discount={0}
                  totalPrice={totalPrice}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Redirection…' : `Payer ${formatPrice(totalPrice)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
