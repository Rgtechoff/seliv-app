import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BETA_COOKIE = 'seliv_beta_access';

async function verifyCode(formData: FormData) {
  'use server';
  const code = (formData.get('code') as string) ?? '';
  const to = (formData.get('redirect') as string) || '/';
  const accessCode = process.env.ACCESS_CODE;

  if (accessCode && code === accessCode) {
    cookies().set(BETA_COOKIE, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/',
    });
    redirect(to);
  }

  const params = new URLSearchParams({ error: '1', redirect: to });
  redirect(`/access?${params}`);
}

interface Props {
  searchParams: { redirect?: string; error?: string };
}

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AccessPage({ searchParams }: Props) {
  const to = searchParams.redirect || '/';
  const hasError = searchParams.error === '1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">SELIV</h1>
          <p className="text-sm text-slate-500">Accès réservé — phase de test</p>
        </div>

        {/* Form */}
        <form action={verifyCode} className="space-y-4">
          <input type="hidden" name="redirect" value={to} />

          <div className="space-y-1">
            <label htmlFor="code" className="block text-sm font-medium text-slate-700">
              Code d&apos;accès
            </label>
            <input
              id="code"
              name="code"
              type="password"
              required
              autoFocus
              autoComplete="off"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          {hasError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              Code incorrect, veuillez réessayer.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            Accéder au site
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Ce site est en phase de test et n&apos;est pas accessible au public.
        </p>
      </div>
    </div>
  );
}
