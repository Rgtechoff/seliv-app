import type { Metadata } from 'next';
import { PublicHeader } from '@/components/landing/public-header';
import { PublicFooter } from '@/components/landing/public-footer';

export const metadata: Metadata = {
  title: 'SELIV — Le Réseau du Live Selling',
  description:
    'SELIV connecte les marques avec les meilleurs vendeurs live shopping. Réservez votre session en quelques clics.',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
