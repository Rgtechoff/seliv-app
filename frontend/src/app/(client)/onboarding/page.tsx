'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/use-auth';
import { usersApi } from '@/lib/api';
import { useState } from 'react';
import { Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-modal p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light mx-auto mb-4">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Bienvenue sur SELIV</h1>
            <p className="text-foreground-secondary text-sm mt-2">
              Complétez votre profil entreprise pour accéder à la plateforme.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                Nom de l&apos;entreprise
              </Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="Ma Boutique SARL"
                className="bg-muted border-border text-foreground placeholder:text-foreground-secondary/60"
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="siret" className="text-sm font-medium text-foreground">
                SIRET{' '}
                <span className="text-foreground-secondary font-normal">(optionnel)</span>
              </Label>
              <Input
                id="siret"
                {...register('siret')}
                placeholder="12345678901234"
                className="bg-muted border-border text-foreground placeholder:text-foreground-secondary/60"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold h-11 transition-colors mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement…' : 'Continuer →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
