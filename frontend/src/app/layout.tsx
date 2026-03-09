import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/shared/theme-provider';

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
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
