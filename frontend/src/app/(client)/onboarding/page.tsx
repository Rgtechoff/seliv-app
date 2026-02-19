'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/use-auth';
import { usersApi } from '@/lib/api';
import { useState } from 'react';

const schema = z.object({
  companyName: z.string().min(1, 'Nom d\'entreprise requis'),
  siret: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await usersApi.updateMe(data);
      updateUser(res.data.data);
      router.push('/subscription');
    } catch {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur SELIV 👋</CardTitle>
          <CardDescription>
            Complétez votre profil entreprise pour accéder à la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
              <Input id="companyName" {...register('companyName')} placeholder="Ma Boutique SARL" />
              {errors.companyName && (
                <p className="text-xs text-destructive">{errors.companyName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="siret">SIRET (optionnel)</Label>
              <Input id="siret" {...register('siret')} placeholder="12345678901234" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : 'Continuer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
