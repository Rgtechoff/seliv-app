'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ListChecks, User, LogOut, CalendarDays } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { PageTransition } from '@/components/page-transition';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/vendeur/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendeur/missions', label: 'Missions dispo', icon: ListChecks },
  { href: '/vendeur/disponibilites', label: 'Disponibilités', icon: CalendarDays },
  { href: '/vendeur/profil', label: 'Mon profil', icon: User },
];

export default function VendeurLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'vendeur')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop uniquement */}
      <aside className="hidden md:flex w-56 bg-white border-r flex-col shrink-0">
        <div className="p-4 border-b">
          <Link href="/vendeur/dashboard" className="text-xl font-bold text-primary">
            SELIV
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.firstName} {user.lastName}
            {user.isStar && ' ⭐'}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="flex md:hidden h-14 border-b bg-white items-center justify-between px-4 sticky top-0 z-40">
          <Link href="/vendeur/dashboard" className="text-xl font-bold text-primary">
            SELIV
          </Link>
          <NotificationBell />
        </header>

        {/* Header desktop */}
        <header className="hidden md:flex h-14 border-b bg-white items-center justify-between px-6 shrink-0">
          <h1 className="text-sm font-medium text-muted-foreground">Espace vendeur</h1>
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 bg-gray-50 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Bottom nav — mobile uniquement */}
      <AppBottomNav role="vendeur" />
    </div>
  );
}
