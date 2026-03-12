import type { Metadata } from 'next';
import { Spline_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { AuthProvider } from '@/lib/auth-context';

const splineSans = Spline_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-spline-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SELIV — Le Réseau du Live Selling',
    template: '%s | SELIV',
  },
  description:
    'Connectez-vous avec des vendeurs professionnels pour vos sessions Live sur Whatnot, TikTok Shop et Instagram.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${splineSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className={`${splineSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
