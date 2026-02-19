'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StarRating } from '@/components/star-rating';
import { useAuth } from '@/lib/hooks/use-auth';
import { usersApi, reviewsApi } from '@/lib/api';
import type { Review } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function VendeurProfilPage() {
  const { user, updateUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      bio: user?.bio ?? '',
      zones: user?.zones ?? [],
      categories: user?.categories ?? [],
    },
  });

  const zones = watch('zones') ?? [];
  const categories = watch('categories') ?? [];

  const CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Nantes', 'Strasbourg'];

  const toggleZone = (z: string) =>
    setValue('zones', zones.includes(z) ? zones.filter((x) => x !== z) : [...zones, z]);

  const toggleCategory = (c: string) =>
    setValue('categories', categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c]);

  useEffect(() => {
    if (!user) return;
    reviewsApi.getByVendeur(user.id).then((res) => {
      const data = res.data;
      setReviews((data.data as Review[]) ?? []);
      setAvgRating(data.meta?.average ?? 0);
    });
  }, [user]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await usersApi.updateMe(data);
      updateUser(res.data.data);
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informations publiques</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {success && (
              <Alert>
                <AlertDescription>Profil mis à jour avec succès.</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea {...register('bio')} rows={4} placeholder="Décrivez votre expérience…" />
            </div>

            <div className="space-y-2">
              <Label>Zones d&apos;intervention</Label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleZone(city)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      zones.includes(city)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat.toLowerCase())}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      categories.includes(cat.toLowerCase())
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Sauvegarder'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Avis ({reviews.length})
            {avgRating > 0 && (
              <span className="flex items-center gap-1">
                <StarRating value={Math.round(avgRating)} />
                <span className="text-sm font-normal text-muted-foreground">
                  {avgRating.toFixed(1)}/5
                </span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <StarRating value={r.rating} size={16} />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(r.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
