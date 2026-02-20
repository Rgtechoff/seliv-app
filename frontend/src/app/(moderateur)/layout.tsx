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
      <div className="p-4 border-b">
        <Link href="/moderateur/dashboard" className="text-lg font-bold text-primary">
          SELIV
        </Link>
        <p className="text-xs text-muted-foreground">Modérateur</p>
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
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop uniquement */}
      <aside className="hidden md:flex w-52 bg-white border-r flex-col shrink-0">
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
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -208 }}
              animate={{ x: 0 }}
              exit={{ x: -208 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed top-0 left-0 h-full w-52 z-50 bg-white border-r flex flex-col md:hidden"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              {sidebarLinks}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="flex md:hidden h-14 border-b bg-white items-center justify-between px-4 sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700">Modération</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
