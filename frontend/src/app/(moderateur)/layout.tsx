'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, LogOut, ListChecks, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/moderateur/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/moderateur/missions', label: 'Missions', icon: ListChecks },
  { href: '/moderateur/chat', label: 'Chat modération', icon: MessageSquare },
];

export default function ModerateurLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && (!user || !['moderateur', 'admin'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const sidebarLinks = (
    <>
      <div className="px-4 py-5 border-b border-border">
        <Link href="/moderateur/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-black text-foreground">SELIV</span>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">Modo</span>
        </Link>
        <p className="text-xs text-foreground-secondary mt-1">Modérateur</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-primary-light border-l-[3px] border-primary text-foreground font-medium'
                : 'text-foreground-secondary hover:text-foreground hover:bg-primary-light',
            )}
          >
            <Icon className={cn('h-4 w-4 flex-shrink-0', pathname === href ? 'text-primary' : '')} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-foreground-secondary hover:text-foreground" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop uniquement */}
      <aside className="hidden md:flex w-52 bg-sidebar border-r border-border flex-col shrink-0">
        {sidebarLinks}
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -208 }}
              animate={{ x: 0 }}
              exit={{ x: -208 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed top-0 left-0 h-full w-52 z-50 bg-sidebar border-r border-border flex flex-col md:hidden"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-primary-light transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarLinks}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="flex md:hidden h-14 border-b border-border bg-sidebar items-center justify-between px-4 sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-primary-light transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">Modération</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
