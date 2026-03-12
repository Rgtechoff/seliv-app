'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, History, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { PageTransition } from '@/components/page-transition';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/missions/new', label: 'Nouvelle mission', icon: PlusCircle },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/subscription', label: 'Abonnement', icon: CreditCard },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'client')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop uniquement */}
      <aside className="hidden md:flex w-56 bg-sidebar border-r border-border flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            SELIV
          </Link>
          <p className="text-xs text-foreground-secondary mt-0.5">
            {user.companyName ?? `${user.firstName} ${user.lastName}`}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-primary-light border-l-[3px] border-primary text-foreground font-medium'
                  : 'hover:bg-muted text-foreground-secondary hover:text-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4', pathname === href ? 'text-primary' : '')} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-foreground-secondary hover:text-foreground hover:bg-muted"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="flex md:hidden h-14 border-b border-border bg-sidebar items-center justify-between px-4 sticky top-0 z-40">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            SELIV
          </Link>
          <NotificationBell />
        </header>

        {/* Header desktop */}
        <header className="hidden md:flex h-14 border-b border-border bg-sidebar items-center justify-between px-6 shrink-0">
          <h1 className="text-sm font-medium text-foreground-secondary">Espace client</h1>
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 bg-background overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Bottom nav — mobile uniquement */}
      <AppBottomNav role="client" />
    </div>
  );
}
