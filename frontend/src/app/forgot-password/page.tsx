'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Vérifiez votre email et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-modal p-8 w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour à la connexion
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
          <p className="text-sm text-foreground-secondary">
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-sm font-medium text-foreground">Email envoyé !</p>
            <p className="text-xs text-foreground-secondary">
              Si un compte existe pour <span className="font-medium text-foreground">{email}</span>, vous recevrez un email avec un lien de réinitialisation dans quelques minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  className="w-full pl-9 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
