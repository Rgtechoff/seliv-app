'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PriceBreakdown } from '@/components/price-breakdown';
import { missionsApi, paymentsApi, missionsPromoApi, pricingPublicApi, type PricingConfigPublic } from '@/lib/api';
import {
  CATEGORIES,
  VOLUMES,
  OPTIONS_CATALOG,
  formatPrice,
  type VolumeEnum,
} from '@/lib/types';
import { CalendarDays, Clock, Sparkles, ShoppingBag, Monitor, Home, ArrowLeft, CreditCard, Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().min(1, 'Heure requise'),
  durationHoursStr: z.string().min(1, 'Durée requise'),
  addressStreet: z.string().min(5, 'Adresse requise (numéro + rue)'),
  addressCity: z.string().min(2, 'Ville requise'),
  addressPostalCode: z.string().min(4, 'Code postal requis'),
  city: z.string().min(2, 'Ville requise'),
  category: z.string().min(1, 'Catégorie requise'),
  volume: z.enum(['30', '50', '100', '200'] as const),
  options: z.array(z.string()).default([]),
});
type FormData = z.infer<typeof schema>;

// Default fallback rates (used before API loads)
const DEFAULT_HOURLY_RATES: Record<VolumeEnum, number> = { '30': 8000, '50': 9000, '100': 11000, '200': 14000 };

function buildDynamicData(configs: PricingConfigPublic[]) {
  const hourlyRates: Record<string, number> = {};
  const dynamicOptions: { key: string; label: string; price: number }[] = [];

  for (const c of configs) {
    if (c.category === 'hourly_rate') {
      // key pattern: rate_30, rate_50, rate_100, rate_200
      const vol = c.key.replace('rate_', '');
      hourlyRates[vol] = c.valueCentimes;
    } else if (c.category === 'option') {
      // key pattern: option_prep_30 → strip 'option_' prefix
      const optKey = c.key.startsWith('option_') ? c.key.slice(7) : c.key;
      dynamicOptions.push({ key: optKey, label: c.label, price: c.valueCentimes });
    }
  }

  return { hourlyRates, dynamicOptions };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Mode: <ShoppingBag className="h-5 w-5" />,
  Beauté: <Sparkles className="h-5 w-5" />,
  Tech: <Monitor className="h-5 w-5" />,
  Maison: <Home className="h-5 w-5" />,
};


interface PromoResult {
  discountAmount: number;
  finalPrice: number;
  discountType: 'percent' | 'fixed' | 'free';
  discountValue: number;
}

export default function NewMissionPage() {
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [hourlyRates, setHourlyRates] = useState<Record<string, number>>(DEFAULT_HOURLY_RATES);
  const [dynamicOptions, setDynamicOptions] = useState<{ key: string; label: string; price: number }[]>(OPTIONS_CATALOG);
  const [dynamicVolumes, setDynamicVolumes] = useState(VOLUMES);

  useEffect(() => {
    void pricingPublicApi.getAll().then((res) => {
      const configs = res.data.data;
      const { hourlyRates: rates, dynamicOptions: opts } = buildDynamicData(configs);
      if (Object.keys(rates).length > 0) {
        setHourlyRates((prev) => ({ ...prev, ...rates }));
        // Rebuild volumes list with updated rates
        setDynamicVolumes(
          VOLUMES.map((v) => ({
            ...v,
            rate: Math.round((rates[v.value] ?? v.rate * 100) / 100),
          })),
        );
      }
      if (opts.length > 0) setDynamicOptions(opts);
    }).catch(() => { /* fallback to defaults */ });
  }, []);

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

  const basePrice = (hourlyRates[volume] ?? 9000) * durationHours;
  const optionsPrice = dynamicOptions.filter((o) => selectedOptions.includes(o.key)).reduce(
    (s, o) => s + o.price,
    0,
  );
  const priceBeforePromo = basePrice + optionsPrice;
  const promoDiscount = promoResult?.discountAmount ?? 0;
  const totalPrice = Math.max(0, priceBeforePromo - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoResult(null);
    try {
      const res = await missionsPromoApi.validatePromo(promoCode.trim(), priceBeforePromo);
      setPromoResult((res.data as { data: PromoResult }).data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setPromoError(err?.response?.data?.message ?? 'Code invalide');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoResult(null);
    setPromoError('');
  };

  const toggleOption = (key: string) => {
    const curr = selectedOptions.includes(key)
      ? selectedOptions.filter((k) => k !== key)
      : [...selectedOptions, key];
    setValue('options', curr);
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      // Build legacy `address` field for backward compatibility
      const address = `${data.addressStreet}, ${data.addressCity} ${data.addressPostalCode}`.trim();
      const res = await missionsApi.create({
        date: data.date,
        startTime: data.startTime,
        durationHours: parseInt(data.durationHoursStr, 10),
        address,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressPostalCode: data.addressPostalCode,
        city: data.addressCity,
        category: data.category,
        volume: data.volume,
        options: data.options.map((key) => {
          const opt = dynamicOptions.find((o) => o.key === key);
          return { optionType: key, price: opt?.price ?? 0 };
        }),
        ...(promoResult && promoCode ? { promoCode: promoCode.toUpperCase() } : {}),
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
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => step === 2 ? setStep(1) : window.history.back()}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Nouvelle Mission</h1>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              s <= step ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* Category selection */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Sélectionnez une catégorie</h2>
              <p className="text-sm text-foreground-secondary mb-4">Quel type de contenu souhaitez-vous créer ?</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.toLowerCase());
                        setValue('category', cat.toLowerCase());
                      }}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left',
                        isSelected
                          ? 'border-primary bg-primary-light'
                          : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        isSelected ? 'bg-primary text-white' : 'bg-muted text-foreground-secondary',
                      )}>
                        {CATEGORY_ICONS[cat] ?? <Sparkles className="h-5 w-5" />}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{cat}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && <p className="text-xs text-destructive mt-2">{errors.category.message}</p>}
            </div>

            {/* Date et Durée */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Date et Durée</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Date de début</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                    <Input
                      type="date"
                      className="pl-9 bg-card border-border text-foreground"
                      {...register('date')}
                    />
                  </div>
                  {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">Heure</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        type="time"
                        className="pl-9 bg-card border-border text-foreground"
                        {...register('startTime')}
                      />
                    </div>
                    {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">Durée</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        type="number"
                        min={2}
                        className="pl-9 bg-card border-border text-foreground"
                        {...register('durationHoursStr')}
                      />
                    </div>
                  </div>
                </div>

                {/* Où — 3 champs adresse séparés */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Où</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">Adresse (numéro + rue)</Label>
                      <Input
                        placeholder="42 rue de la Paix"
                        className="bg-card border-border text-foreground placeholder:text-foreground-secondary/60"
                        {...register('addressStreet')}
                      />
                      {errors.addressStreet && <p className="text-xs text-destructive">{errors.addressStreet.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground">Ville</Label>
                        <Input
                          placeholder="Paris"
                          className="bg-card border-border text-foreground placeholder:text-foreground-secondary/60"
                          {...register('addressCity')}
                        />
                        {errors.addressCity && <p className="text-xs text-destructive">{errors.addressCity.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground">Code postal</Label>
                        <Input
                          placeholder="75011"
                          className="bg-card border-border text-foreground placeholder:text-foreground-secondary/60"
                          {...register('addressPostalCode')}
                        />
                        {errors.addressPostalCode && <p className="text-xs text-destructive">{errors.addressPostalCode.message}</p>}
                      </div>
                    </div>

                    {/* Privacy notice */}
                    <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-800/40 rounded-xl text-xs text-amber-400">
                      <span>🔒</span>
                      <p>Votre adresse exacte ne sera communiquée au vendeur qu&apos;après son acceptation. Seuls la ville et le code postal seront visibles avant.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Volume d&apos;articles</Label>
                  <Controller
                    control={control}
                    name="volume"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-card border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {dynamicVolumes.map((v) => (
                            <SelectItem key={v.value} value={v.value} className="text-foreground">
                              {v.label} — {v.rate}€/h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold h-11"
              onClick={() => setStep(2)}
            >
              Suivant : Options
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Options */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Options</h2>
              <div className="space-y-2">
                {dynamicOptions.map((opt) => {
                  const checked = selectedOptions.includes(opt.key);
                  return (
                    <label
                      key={opt.key}
                      className={cn(
                        'flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all',
                        checked
                          ? 'border-primary bg-primary-light'
                          : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                          checked ? 'bg-primary border-primary' : 'border-border',
                        )}>
                          {checked && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOption(opt.key)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatPrice(opt.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Code promo */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Code promo
              </h3>
              {promoResult ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-semibold text-foreground font-mono">{promoCode.toUpperCase()}</span>
                    <span className="text-sm text-success">
                      -{formatPrice(promoResult.discountAmount)}
                    </span>
                  </div>
                  <button type="button" onClick={handleRemovePromo} className="text-foreground-secondary hover:text-destructive transition-colors">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="ESSAI2024"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                    className="font-mono uppercase bg-background border-border"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleApplyPromo(); } }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="shrink-0"
                  >
                    {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Appliquer'}
                  </Button>
                </div>
              )}
              {promoError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> {promoError}
                </p>
              )}
            </div>

            {/* Price summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Récapitulatif du prix</h3>
              <PriceBreakdown
                basePrice={basePrice}
                optionsPrice={optionsPrice}
                discount={0}
                promoDiscount={promoDiscount}
                totalPrice={totalPrice}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold h-11 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <CreditCard className="h-4 w-4" />
              {isSubmitting ? 'Redirection…' : `Payer et Valider — ${formatPrice(totalPrice)}`}
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-foreground-secondary hover:text-foreground transition-colors py-2"
            >
              Retour
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
