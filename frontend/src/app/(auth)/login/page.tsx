'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/use-auth';
import type { UserRole } from '@/lib/types';
import { Mail, Lock, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

const ROLE_REDIRECT: Record<UserRole, string> = {
  client: '/dashboard',
  vendeur: '/vendeur/dashboard',
  moderateur: '/moderateur/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'vendeur'>('client');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const user = await login(data.email, data.password);
      router.push(redirectTo ?? ROLE_REDIRECT[user.role] ?? '/');
    } catch {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-modal p-8">
      {/* Logo + title */}
      <div className="text-center mb-6">
        <p className="text-primary font-bold text-lg tracking-wide mb-1">SELIV</p>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-foreground-secondary text-sm mt-1">
          Please choose your role and enter your details
        </p>
      </div>

      {/* Login / Register tabs */}
      <div className="flex bg-muted rounded-lg p-1 mb-6">
        <div className="flex-1 text-center py-2 rounded-md bg-card text-foreground text-sm font-medium shadow-sm">
          Login
        </div>
        <Link
          href="/register"
          className="flex-1 text-center py-2 rounded-md text-foreground-secondary text-sm font-medium hover:text-foreground transition-colors"
        >
          Register
        </Link>
      </div>

      {/* Role selector */}
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-3">Select your role</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('client')}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border transition-all text-left',
              selectedRole === 'client'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-muted/40 hover:border-border/80',
            )}
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5',
              selectedRole === 'client' ? 'bg-primary' : 'bg-muted',
            )}>
              <User className={cn('h-4 w-4', selectedRole === 'client' ? 'text-white' : 'text-foreground-secondary')} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Client</p>
              <p className="text-xs text-foreground-secondary leading-tight">Browse and buy exclusive products</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('vendeur')}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border transition-all text-left',
              selectedRole === 'vendeur'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-muted/40 hover:border-border/80',
            )}
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5',
              selectedRole === 'vendeur' ? 'bg-primary' : 'bg-muted',
            )}>
              <ShoppingBag className={cn('h-4 w-4', selectedRole === 'vendeur' ? 'text-white' : 'text-foreground-secondary')} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Vendeur</p>
              <p className="text-xs text-foreground-secondary leading-tight">Manage your shop and sell items</p>
            </div>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="pl-9 bg-muted border-border text-foreground placeholder:text-foreground-secondary/60"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <Input
              id="password"
              type="password"
              className="pl-9 bg-muted border-border text-foreground"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold h-11 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connexion…' : 'Sign In →'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs text-foreground-secondary uppercase tracking-wider">
          <span className="bg-card px-3">OR CONTINUE WITH</span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 border border-border bg-muted/40 rounded-lg py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 border border-border bg-muted/40 rounded-lg py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-foreground-secondary/60 mt-6">
        © 2024 SELIV Platforms. All rights reserved.{' '}
        <Link href="/privacy" className="hover:text-foreground-secondary underline">Privacy Policy</Link>
        {' · '}
        <Link href="/terms" className="hover:text-foreground-secondary underline">Terms of Service</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
