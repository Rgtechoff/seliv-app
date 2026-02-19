'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/use-auth';
import { usersApi } from '@/lib/api';
import { CATEGORIES } from '@/lib/types';

const CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Nantes', 'Strasbourg'];

const schema = z.object({
  level: z.enum(['debutant', 'confirme', 'star']),
  bio: z.string().min(20, 'Bio trop courte (min 20 caractères)'),
  zones: z.array(z.string()).min(1, 'Sélectionnez au moins une zone'),
  categories: z.array(z.string()).min(1, 'Sélectionnez au moins une catégorie'),
});
type FormData = z.infer<typeof schema>;

export default function VendeurOnboardingPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { zones: [], categories: [], level: 'debutant' },
  });

  const zones = watch('zones') ?? [];
  const categories = watch('categories') ?? [];

  const toggleZone = (z: string) =>
    setValue('zones', zones.includes(z) ? zones.filter((x) => x !== z) : [...zones, z]);

  const toggleCategory = (c: string) =>
    setValue('categories', categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c]);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await usersApi.updateMe(data);
      updateUser(res.data.data);
      router.push('/vendeur/dashboard');
    } catch {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complétez votre profil vendeur</CardTitle>
          <CardDescription>
            Ces informations servent à vous mettre en relation avec les bons clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            )}

            <div className="space-y-1">
              <Label>Niveau d&apos;expérience</Label>
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant</SelectItem>
                      <SelectItem value="confirme">Confirmé</SelectItem>
                      <SelectItem value="star">Star</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea
                {...register('bio')}
                placeholder="Décrivez votre expérience en live selling…"
                rows={4}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
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
              {errors.zones && <p className="text-xs text-destructive">{errors.zones.message}</p>}
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
              {errors.categories && (
                <p className="text-xs text-destructive">{errors.categories.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : 'Accéder au dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
