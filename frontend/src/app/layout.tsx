import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

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
    <html lang="fr">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
